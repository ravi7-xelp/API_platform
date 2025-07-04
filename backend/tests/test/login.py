import pytest
from playwright.sync_api import sync_playwright


def test_api_list_link():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto("http://localhost:3000/")
        page.get_by_role("link", name="API List").click()
        # Add assertions here if needed
        page.close()
        context.close()
        browser.close()
