import PinMap from "../../components/functions/PinMap";
import AppLayout from '../../components/layout/AppLayout';

export default function MapPage() {
    return (
        <AppLayout>
            <div>
                <h1>Visited Places</h1>
                <PinMap />
            </div>
        </AppLayout>
    );
}
