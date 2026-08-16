import requests
import os
import re
from typing import Optional, Dict, Any, List

CURATED_TECH_JOBS: List[Dict[str, Any]] = [
    {
        "id": "job_g_sde_01",
        "title": "Software Engineering Intern (Summer 2026)",
        "company": {"display_name": "Google"},
        "location": {"display_name": "Bengaluru, Karnataka, India"},
        "salary_min": 95000,
        "salary_max": 120000,
        "salary_period": "month",
        "description": "Join Google as a Software Engineering Intern to design and develop next-generation distributed systems, web services, and AI infrastructure. You will work on real-world engineering challenges alongside seasoned technical leads.",
        "category": {"tag": "it-jobs", "label": "Software Development"},
        "work_mode": "Hybrid",
        "experience_level": "Internship",
        "skills": ["Data Structures", "Algorithms", "C++", "Java", "Python", "System Design"],
        "redirect_url": "https://careers.google.com/jobs/results/",
        "created": "2026-08-14T10:00:00Z"
    },
    {
        "id": "job_ms_ai_02",
        "title": "AI / Machine Learning Engineering Intern",
        "company": {"display_name": "Microsoft"},
        "location": {"display_name": "Hyderabad, Telangana, India"},
        "salary_min": 90000,
        "salary_max": 115000,
        "salary_period": "month",
        "description": "Develop and fine-tune large multimodal foundation models and integrate Copilot intelligence into global cloud services on Azure. Strong foundation in PyTorch, Python, and transformer architectures required.",
        "category": {"tag": "it-jobs", "label": "AI & Data Science"},
        "work_mode": "Hybrid",
        "experience_level": "Internship",
        "skills": ["PyTorch", "Python", "NLP", "LangChain", "Vector DBs", "RAG"],
        "redirect_url": "https://careers.microsoft.com/",
        "created": "2026-08-15T08:30:00Z"
    },
    {
        "id": "job_amz_sde_03",
        "title": "SDE Intern - AWS Cloud Platform",
        "company": {"display_name": "Amazon"},
        "location": {"display_name": "Bengaluru, Karnataka, India"},
        "salary_min": 85000,
        "salary_max": 110000,
        "salary_period": "month",
        "description": "Build high-throughput, low-latency microservices for AWS compute and storage services. Work with distributed databases, serverless computing, and fault-tolerant infrastructure.",
        "category": {"tag": "it-jobs", "label": "Cloud & DevOps"},
        "work_mode": "On-site",
        "experience_level": "Internship",
        "skills": ["Java", "AWS", "DynamoDB", "Microservices", "Docker", "Algorithms"],
        "redirect_url": "https://amazon.jobs/",
        "created": "2026-08-12T14:15:00Z"
    },
    {
        "id": "job_stripe_fe_04",
        "title": "Frontend Engineer Intern - Payments Core",
        "company": {"display_name": "Stripe"},
        "location": {"display_name": "Remote, India"},
        "salary_min": 85000,
        "salary_max": 105000,
        "salary_period": "month",
        "description": "Craft pixel-perfect, accessible, and high-performance financial interfaces used by millions of businesses globally. Expertise in modern TypeScript, React, state machines, and web vitals.",
        "category": {"tag": "it-jobs", "label": "Frontend"},
        "work_mode": "Remote",
        "experience_level": "Internship",
        "skills": ["React 19", "TypeScript", "Tailwind CSS", "Next.js", "Web Performance"],
        "redirect_url": "https://stripe.com/jobs",
        "created": "2026-08-16T09:00:00Z"
    },
    {
        "id": "job_uber_be_05",
        "title": "Backend Engineering Intern - Dispatch Core",
        "company": {"display_name": "Uber"},
        "location": {"display_name": "Bengaluru, Karnataka, India"},
        "salary_min": 88000,
        "salary_max": 110000,
        "salary_period": "month",
        "description": "Optimize real-time geospatial marketplace algorithms, driver-rider matching engines, and high-throughput Kafka streaming pipelines.",
        "category": {"tag": "it-jobs", "label": "Backend"},
        "work_mode": "Hybrid",
        "experience_level": "Internship",
        "skills": ["Go", "Java", "Kafka", "Redis", "Distributed Systems", "PostgreSQL"],
        "redirect_url": "https://www.uber.com/careers",
        "created": "2026-08-13T11:00:00Z"
    },
    {
        "id": "job_razor_fs_06",
        "title": "Full Stack Developer (Entry Level / Fresher)",
        "company": {"display_name": "Razorpay"},
        "location": {"display_name": "Bengaluru, Karnataka, India"},
        "salary_min": 1400000,
        "salary_max": 1800000,
        "salary_period": "year",
        "description": "Build next-generation payment gateway solutions, merchant dashboards, and banking API integrations with high reliability and zero downtime.",
        "category": {"tag": "it-jobs", "label": "Full Stack"},
        "work_mode": "Hybrid",
        "experience_level": "Entry Level",
        "skills": ["Node.js", "React", "TypeScript", "MySQL", "Redis", "Docker"],
        "redirect_url": "https://razorpay.com/jobs/",
        "created": "2026-08-11T16:00:00Z"
    },
    {
        "id": "job_cred_be_07",
        "title": "Backend Platform Engineer - Rewards Engine",
        "company": {"display_name": "CRED"},
        "location": {"display_name": "Bengaluru, Karnataka, India"},
        "salary_min": 1600000,
        "salary_max": 2200000,
        "salary_period": "year",
        "description": "Design ultra-low latency event-driven architectures handling millions of financial transactions per second. Highly scalable Golang and Java platforms.",
        "category": {"tag": "it-jobs", "label": "Backend"},
        "work_mode": "On-site",
        "experience_level": "Entry Level",
        "skills": ["Go", "Kafka", "Microservices", "PostgreSQL", "Kubernetes", "Redis"],
        "redirect_url": "https://cred.club/careers",
        "created": "2026-08-10T12:00:00Z"
    },
    {
        "id": "job_flip_sde_08",
        "title": "SDE Intern - Supply Chain & Logistics",
        "company": {"display_name": "Flipkart"},
        "location": {"display_name": "Bengaluru, Karnataka, India"},
        "salary_min": 75000,
        "salary_max": 90000,
        "salary_period": "month",
        "description": "Work with the team optimizing supply chain routing, inventory forecasting, and real-time package tracking systems across India.",
        "category": {"tag": "it-jobs", "label": "Software Development"},
        "work_mode": "Hybrid",
        "experience_level": "Internship",
        "skills": ["Java", "Spring Boot", "Data Structures", "MySQL", "Docker"],
        "redirect_url": "https://www.flipkartcareers.com/",
        "created": "2026-08-09T10:00:00Z"
    },
    {
        "id": "job_swiggy_ds_09",
        "title": "Data Science & Analytics Intern",
        "company": {"display_name": "Swiggy"},
        "location": {"display_name": "Remote, India"},
        "salary_min": 70000,
        "salary_max": 85000,
        "salary_period": "month",
        "description": "Build predictive models for demand estimation, delivery time prediction, and dynamic pricing using big data pipelines (Spark, Snowflake, Python).",
        "category": {"tag": "it-jobs", "label": "AI & Data Science"},
        "work_mode": "Remote",
        "experience_level": "Internship",
        "skills": ["Python", "SQL", "Machine Learning", "Pandas", "Spark", "Tableau"],
        "redirect_url": "https://careers.swiggy.com/",
        "created": "2026-08-14T15:00:00Z"
    },
    {
        "id": "job_atlas_devops_10",
        "title": "Cloud & DevOps Intern - Site Reliability",
        "company": {"display_name": "Atlassian"},
        "location": {"display_name": "Bengaluru, Karnataka, India"},
        "salary_min": 80000,
        "salary_max": 95000,
        "salary_period": "month",
        "description": "Automate CI/CD pipelines, manage Kubernetes clusters on AWS, and establish observability frameworks (Prometheus, Grafana, OpenTelemetry) for Jira and Confluence.",
        "category": {"tag": "it-jobs", "label": "Cloud & DevOps"},
        "work_mode": "Remote",
        "experience_level": "Internship",
        "skills": ["Kubernetes", "Terraform", "AWS", "Python", "CI/CD", "Prometheus"],
        "redirect_url": "https://www.atlassian.com/company/careers",
        "created": "2026-08-15T11:20:00Z"
    },
    {
        "id": "job_zepto_fs_11",
        "title": "Full Stack Engineer - Quick Commerce Core",
        "company": {"display_name": "Zepto"},
        "location": {"display_name": "Mumbai, Maharashtra, India"},
        "salary_min": 1500000,
        "salary_max": 2000000,
        "salary_period": "year",
        "description": "Build 10-minute grocery delivery dispatch and picker application systems. Scale Node.js and React Native systems under intense traffic bursts.",
        "category": {"tag": "it-jobs", "label": "Full Stack"},
        "work_mode": "Hybrid",
        "experience_level": "Entry Level",
        "skills": ["React", "Node.js", "MongoDB", "Redis", "Kafka", "AWS"],
        "redirect_url": "https://www.zeptonow.com/careers",
        "created": "2026-08-12T09:00:00Z"
    },
    {
        "id": "job_postman_api_12",
        "title": "API Platform Engineer Intern",
        "company": {"display_name": "Postman"},
        "location": {"display_name": "Remote, India"},
        "salary_min": 75000,
        "salary_max": 90000,
        "salary_period": "month",
        "description": "Enhance the world's leading API collaboration platform used by over 30 million developers. Work on GraphQL, WebSockets, and developer tooling.",
        "category": {"tag": "it-jobs", "label": "Software Development"},
        "work_mode": "Remote",
        "experience_level": "Internship",
        "skills": ["TypeScript", "Node.js", "WebSockets", "GraphQL", "Docker"],
        "redirect_url": "https://www.postman.com/company/careers/",
        "created": "2026-08-13T13:45:00Z"
    }
]

CATEGORIES_LIST = [
    {"tag": "", "label": "All Opportunities", "count": 280},
    {"tag": "it-jobs", "label": "Software Development", "count": 145},
    {"tag": "frontend", "label": "Frontend & Web", "count": 68},
    {"tag": "backend", "label": "Backend & Systems", "count": 84},
    {"tag": "ai-data", "label": "AI, ML & Data Science", "count": 52},
    {"tag": "cloud-devops", "label": "Cloud & DevOps", "count": 41},
    {"tag": "fullstack", "label": "Full Stack Engineering", "count": 92}
]

def fetch_adzuna_data(endpoint: str, params: Optional[Dict[str, Any]] = None):
    base_url = os.getenv("ADZUNA_BASE_URL", "https://api.adzuna.com/v1/api/jobs/in")
    params = params or {}
    params.update({
        "app_id": os.getenv("ADZUNA_APP_ID", "2eef96a9"),
        "app_key": os.getenv("ADZUNA_APP_KEY", "32d0ff243f777d3114d98b4e0f705752"),
        "content-type": "application/json"
    })
    
    try:
        response = requests.get(f"{base_url}/{endpoint}", params=params, timeout=8)
        return response.json() if response.status_code == 200 else None
    except requests.RequestException:
        return None

def get_categories_service():
    adzuna_data = fetch_adzuna_data("categories")
    if adzuna_data and adzuna_data.get("results"):
        return [{"tag": c["tag"], "label": c["label"]} for c in adzuna_data.get("results", [])]
    return CATEGORIES_LIST

def search_jobs_service(
    query: str = "", 
    category: str = "", 
    location: str = "India", 
    work_mode: str = "All",
    experience_level: str = "All",
    page: int = 1,
    limit: int = 12
) -> Dict[str, Any]:
    # 1. Try fetching from Adzuna if available
    params = {
        "what": query if query else None,
        "where": location if location and location != "All" else "India",
        "category": category if category else None,
        "results_per_page": limit
    }
    params = {k: v for k, v in params.items() if v is not None}
    adzuna_response = fetch_adzuna_data(f"search/{page}", params)
    
    if adzuna_response and adzuna_response.get("results") and len(adzuna_response.get("results", [])) > 0:
        raw_results = adzuna_response.get("results", [])
        enriched_results = []
        for idx, job in enumerate(raw_results):
            sal_min = job.get("salary_min")
            sal_max = job.get("salary_max")
            desc = re.sub(r'<[^>]+>', '', job.get("description", "Exciting software opportunity with a leading tech organization."))
            loc_name = job.get("location", {}).get("display_name", "Bengaluru, India")
            
            # Infer work mode
            mode = "Remote" if "remote" in desc.lower() or "remote" in loc_name.lower() else "Hybrid" if idx % 2 == 0 else "On-site"
            exp = "Internship" if "intern" in job.get("title", "").lower() or "intern" in desc.lower() else "Entry Level"
            
            enriched_results.append({
                "id": str(job.get("id", f"adzuna_{idx}")),
                "title": job.get("title", "Software Engineer"),
                "company": {"display_name": job.get("company", {}).get("display_name", "Tech Enterprise")},
                "location": {"display_name": loc_name},
                "salary_min": sal_min,
                "salary_max": sal_max,
                "salary_period": "month" if sal_min and sal_min < 200000 else "year",
                "description": desc,
                "work_mode": mode,
                "experience_level": exp,
                "skills": ["Algorithms", "Problem Solving", "Web Architecture", "Database"],
                "redirect_url": job.get("redirect_url", "https://adzuna.com"),
                "created": job.get("created", "2026-08-16T00:00:00Z")
            })
            
        return {
            "results": enriched_results,
            "total": adzuna_response.get("count", len(enriched_results)),
            "page": page,
            "total_pages": max(1, (adzuna_response.get("count", len(enriched_results)) + limit - 1) // limit)
        }

    # 2. Fallback to Curated Rich Database with Deep Filtering
    filtered = CURATED_TECH_JOBS
    
    # Query filter
    if query and query.strip():
        q_lower = query.lower().strip()
        filtered = [
            j for j in filtered 
            if q_lower in j["title"].lower() or 
               q_lower in j["company"]["display_name"].lower() or
               any(q_lower in s.lower() for s in j.get("skills", [])) or
               q_lower in j["description"].lower()
        ]
        
    # Category filter
    if category and category.strip() and category != "all":
        cat_lower = category.lower().strip()
        filtered = [
            j for j in filtered 
            if cat_lower in j.get("category", {}).get("tag", "").lower() or
               cat_lower in j.get("category", {}).get("label", "").lower() or
               cat_lower in j["title"].lower()
        ]

    # Location filter
    if location and location != "All" and location != "India":
        loc_lower = location.lower()
        filtered = [
            j for j in filtered 
            if loc_lower in j["location"]["display_name"].lower() or
               (loc_lower == "remote" and j["work_mode"].lower() == "remote")
        ]

    # Work mode filter
    if work_mode and work_mode != "All":
        filtered = [j for j in filtered if j.get("work_mode", "").lower() == work_mode.lower()]

    # Experience level filter
    if experience_level and experience_level != "All":
        filtered = [j for j in filtered if j.get("experience_level", "").lower() == experience_level.lower()]

    # Pagination
    total = len(filtered)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated = filtered[start_idx:end_idx]

    return {
        "results": paginated,
        "total": total,
        "page": page,
        "total_pages": max(1, (total + limit - 1) // limit)
    }