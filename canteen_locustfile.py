from locust import HttpUser, task, between
import random

class CanteenStudentUser(HttpUser):
    # Mimics student browsing interval between 1 and 3 seconds
    wait_time = between(1, 3)

    @task(4)
    def view_canteen_homepage(self):
        """Simulates students visiting the main Canteen portal"""
        self.client.get("/", name="Homepage (Canteen Portal)")

    @task(3)
    def view_canteen_menu(self):
        """Simulates students checking daily menu items"""
        self.client.get("/api/menu", name="/api/menu (Daily Canteen Menu)", catch_response=True)

    @task(2)
    def check_food_categories(self):
        """Simulates filtering food categories (Snacks, Beverages, Meals)"""
        category = random.choice(["breakfast", "lunch", "snacks", "beverages"])
        self.client.get(f"/api/menu?category={category}", name=f"/api/menu?category={category}")

    @task(1)
    def simulate_food_order_check(self):
        """Simulates student checking order queue status"""
        order_id = random.randint(100, 999)
        self.client.get(f"/api/orders/{order_id}", name="/api/orders/{id} (Order Status)", catch_response=True)
