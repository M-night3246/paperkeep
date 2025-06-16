from datetime import datetime

def to_python_from_json_datetime(dt):
    return datetime.strptime(dt, "%d/%m/%Y %H:%M:%S")

def to_python_from_html_datetime(dt):
    return datetime.strptime(dt, "%Y-%m-%dT%H:%M")

def to_html_from_python_datetime(dt):
    return datetime.strftime(dt, '%Y-%m-%dT%H:%M')