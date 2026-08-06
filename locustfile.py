from locust import HttpUser, task, between
import random

class WebsiteStudentUser(HttpUser):
    # Wait between 1 and 3 seconds between actions (mimics real human behavior)
    wait_time = between(1, 3)

    @task(5)
    def view_live_bus_locations(self):
        """Simulates students viewing live bus locations on map"""
        self.client.get("/api/bus-locations", name="/api/bus-locations (Live Locations)")

    @task(2)
    def view_bus_routes(self):
        """Simulates students loading static bus routes JSON"""
        self.client.get("/bus_routes.json", name="/bus_routes.json (Routes Data)")

    @task(1)
    def simulate_driver_broadcast(self):
        """Simulates a driver app broadcasting GPS coordinates"""
        route_num = random.randint(1, 15)
        lat = 13.0118 + random.uniform(-0.01, 0.01)
        lng = 80.0214 + random.uniform(-0.01, 0.01)
        self.client.post(
            f"/api/bus-locations/R{route_num:02d}?lat={lat:.6f}&lng={lng:.6f}&pin=RITDRIVER",
            name="/api/bus-locations/R{id} (Driver Broadcast)"
        )
