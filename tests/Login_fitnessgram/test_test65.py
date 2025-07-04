from playwright.sync_api import sync_playwright, expect

def test_test65():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto("http://50.19.46./")
        page.get_by_text("Login here").click()
        page.get_by_text("* Password & District Code").click()
        page.get_by_text("is one of the most widely").click()

        # ---------------------
        context.close()
        browser.close()
