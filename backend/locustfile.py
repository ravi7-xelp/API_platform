
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(0.5, 1.5)

    @task
    def my_task(self):
        self.client.request(
            "POST",
            "/api/fitnessGram/getEventStudentList/e7fc94d0-3ea4-4d0c-8f7c-1a45e1a06333",
            headers={},
            data=None
        )
