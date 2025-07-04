from playwright.sync_api import sync_playwright, expect

def test_tesryf():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto("http://50.19.46.175/")
        page.get_by_role("img").first.click()
        page.get_by_text("Login here* Password &").click()
        page.close()

        # ---------------------
        context.close()
        browser.close()
