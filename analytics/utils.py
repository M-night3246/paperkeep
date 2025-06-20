import os
from paperkeep.settings import MEDIA_ROOT, BASE_DIR
import requests
import pandas as pd
import folium
from folium.plugins import HeatMap
import pandas as pd
import requests
import google.generativeai as genai
from django.conf import settings
from decimal import Decimal
from datetime import datetime
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()

mapbox_token = os.getenv("MAPBOX_TOKEN")

# Function to geocode an address and get coordinates
def geocode_address(address):
    geocode_url = f'https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json'
    response = requests.get(geocode_url, params={'access_token': mapbox_token})
    data = response.json()
    
    if data['features']:
        coordinates = data['features'][0]['geometry']['coordinates']
        return coordinates[1], coordinates[0]  # lat, lon
    else:
        return None, None

# Function to save coordinates to CSV
def save_coordinates_to_csv(lat, lng, filename='locations.csv'):
    file_path = os.path.join(MEDIA_ROOT, filename)
    data = pd.DataFrame([[lat, lng]], columns=['lat', 'lng'])
    data.to_csv(file_path, mode='a', header=False, index=False)

# Function to load previous coordinates from CSV
def load_previous_coordinates(filename='locations.csv'):
    file_path = os.path.join(MEDIA_ROOT, filename)
    print(file_path)
    try:
        return pd.read_csv(file_path).values.tolist()
    except FileNotFoundError:
        return []

# Function to create a heatmap from coordinates
def create_heatmap(coordinates, map_filename='heatmap.html'):
    if len(coordinates) == 0:
        print("No coordinates to display.")
        return
    
    map_center = [sum([coord[0] for coord in coordinates]) / len(coordinates),
                  sum([coord[1] for coord in coordinates]) / len(coordinates)]
    
    map = folium.Map(location=map_center, zoom_start=12)
    
    folium.TileLayer(
        tiles='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attr='Map data &copy; OpenStreetMap contributors',
        name='OpenStreetMap',
        overlay=False,
        control=True
    ).add_to(map)
    
    HeatMap(coordinates).add_to(map)
    
    template_dir = os.path.join(BASE_DIR, 'analytics', 'templates')
    
    # # Ensure the directory exists (if not, create it)
    # if not os.path.exists(template_dir):
    #     os.makedirs(template_dir)
    
    # Define the full path for saving the heatmap.html inside the templates folder
    map_path = os.path.join(template_dir, map_filename)
    
    map.save(map_path)

# Function to update heatmap with a new address
def update_heatmap_with_new_address(address):
    coordinates = load_previous_coordinates()
    new_coordinates = geocode_address(address)
    if new_coordinates:
        coordinates.append(new_coordinates)
        save_coordinates_to_csv(new_coordinates[0], new_coordinates[1])
    
    print(coordinates)
    create_heatmap(coordinates)
    
    
    



