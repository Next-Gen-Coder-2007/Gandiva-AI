import requests
import os

def fetch_adzuna_data(endpoint, params=None):
    base_url = os.getenv("ADZUNA_BASE_URL")
    params = params or {}
    params.update({
        "app_id": os.getenv("ADZUNA_APP_ID"),
        "app_key": os.getenv("ADZUNA_APP_KEY"),
        "content-type": "application/json"
    })
    
    try:
        response = requests.get(f"{base_url}/{endpoint}", params=params, timeout=10)
        return response.json() if response.status_code == 200 else None
    except requests.RequestException:
        return None

def get_categories_service():
    data = fetch_adzuna_data("categories")
    return [{"tag": c["tag"], "label": c["label"]} for c in data.get("results", [])] if data else None

def search_jobs_service(query, category, location, page):
    params = {
        "what": query or None,
        "where": location,
        "category": category or None,
        "results_per_page": 20
    }
    params = {k: v for k, v in params.items() if v is not None}
    return fetch_adzuna_data(f"search/{page}", params)