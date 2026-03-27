#!/usr/bin/env python3
"""
Backend API Test Suite for Business Consultant Website
Tests all CRUD operations for the business consultant website API endpoints
"""

import requests
import json
from datetime import datetime, timedelta
import uuid

# Base URL from environment
BASE_URL = "https://strategy-hub-121.preview.emergentagent.com/api"

# Test data
TEST_CONTACT = {
    "name": "Sarah Johnson",
    "email": "sarah.johnson@techcorp.com", 
    "company": "TechCorp Solutions",
    "message": "I need help with digital transformation strategy for my company."
}

TEST_NEWSLETTER_EMAIL = "newsletter.test@example.com"
TEST_DUPLICATE_EMAIL = "duplicate@example.com"

TEST_CASE_STUDY = {
    "title": "Digital Transformation for Manufacturing Company",
    "category": "Digital Strategy", 
    "result": "40% increase in operational efficiency",
    "description": "Complete digital overhaul of manufacturing processes using IoT and AI technologies",
    "image": "https://example.com/case-study-image.jpg",
    "metrics": [
        {"label": "Efficiency Increase", "value": "40%"},
        {"label": "Cost Reduction", "value": "25%"}
    ]
}

TEST_ARTICLE = {
    "title": "The Future of Business Strategy in 2025",
    "category": "Strategy",
    "excerpt": "Exploring emerging trends in business strategy...",
    "content": "In today's rapidly evolving business landscape, organizations must adapt their strategies to remain competitive. This comprehensive guide explores the key trends that will shape business strategy in 2025 and beyond.",
    "author": "House of Parise Reed"
}

TEST_CONSULTATION = {
    "name": "Michael Chen", 
    "email": "michael.chen@startup.io",
    "company": "StartupIO",
    "date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
    "time": "14:00",
    "topic": "Growth Strategy Consultation"
}

def test_health_check():
    """Test health check endpoint"""
    print("\n🔍 Testing Health Check API...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            if 'status' in data and data['status'] == 'healthy':
                print("✅ Health check API working correctly")
                return True
            else:
                print("❌ Health check API returned invalid response format")
                return False
        else:
            print(f"❌ Health check API failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check API failed with error: {e}")
        return False

def test_contact_form_api():
    """Test contact form submission API"""
    print("\n🔍 Testing Contact Form API...")
    
    # Test valid submission
    try:
        response = requests.post(f"{BASE_URL}/contact", json=TEST_CONTACT, timeout=10)
        print(f"Valid submission - Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            if data.get('success') and 'data' in data and 'id' in data['data']:
                print("✅ Contact form submission working correctly")
                contact_id = data['data']['id']
                
                # Test getting all contacts
                get_response = requests.get(f"{BASE_URL}/contacts", timeout=10)
                if get_response.status_code == 200:
                    contacts_data = get_response.json()
                    print(f"Get contacts response: {contacts_data.get('success', False)}")
                    if contacts_data.get('success') and len(contacts_data.get('data', [])) > 0:
                        print("✅ GET /api/contacts working correctly")
                    else:
                        print("❌ GET /api/contacts returned no data")
                        return False
                else:
                    print(f"❌ GET /api/contacts failed with status: {get_response.status_code}")
                    return False
                
                return True
            else:
                print("❌ Contact form API returned invalid response format")
                return False
        else:
            print(f"❌ Contact form submission failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Contact form API failed with error: {e}")
        return False

def test_contact_form_validation():
    """Test contact form validation"""
    print("\n🔍 Testing Contact Form Validation...")
    
    # Test missing required fields
    invalid_data = {"name": "Test", "email": ""}  # Missing message and invalid email
    try:
        response = requests.post(f"{BASE_URL}/contact", json=invalid_data, timeout=10)
        if response.status_code == 400:
            print("✅ Contact form validation working correctly")
            return True
        else:
            print(f"❌ Contact form validation failed - expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Contact form validation test failed with error: {e}")
        return False

def test_newsletter_api():
    """Test newsletter subscription API"""
    print("\n🔍 Testing Newsletter Subscription API...")
    
    # Test valid subscription
    try:
        response = requests.post(f"{BASE_URL}/newsletter", json={"email": TEST_NEWSLETTER_EMAIL}, timeout=10)
        print(f"Valid subscription - Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            if data.get('success') and 'data' in data and 'id' in data['data']:
                print("✅ Newsletter subscription working correctly")
                
                # Test duplicate subscription
                dup_response = requests.post(f"{BASE_URL}/newsletter", json={"email": TEST_NEWSLETTER_EMAIL}, timeout=10)
                if dup_response.status_code == 200:
                    dup_data = dup_response.json()
                    if dup_data.get('success') and 'Already subscribed' in dup_data.get('message', ''):
                        print("✅ Newsletter duplicate handling working correctly")
                    else:
                        print("❌ Newsletter duplicate handling failed")
                        return False
                else:
                    print(f"❌ Newsletter duplicate test failed with status: {dup_response.status_code}")
                    return False
                
                # Test getting all subscribers
                get_response = requests.get(f"{BASE_URL}/newsletter", timeout=10)
                if get_response.status_code == 200:
                    newsletter_data = get_response.json()
                    if newsletter_data.get('success') and len(newsletter_data.get('data', [])) > 0:
                        print("✅ GET /api/newsletter working correctly")
                    else:
                        print("❌ GET /api/newsletter returned no data")
                        return False
                else:
                    print(f"❌ GET /api/newsletter failed with status: {get_response.status_code}")
                    return False
                
                return True
            else:
                print("❌ Newsletter subscription API returned invalid response format")
                return False
        else:
            print(f"❌ Newsletter subscription failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Newsletter subscription API failed with error: {e}")
        return False

def test_case_studies_api():
    """Test case studies CRUD API"""
    print("\n🔍 Testing Case Studies CRUD API...")
    
    # Test creating case study
    try:
        response = requests.post(f"{BASE_URL}/case-studies", json=TEST_CASE_STUDY, timeout=10)
        print(f"Create case study - Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"Create Response: {json.dumps(data, indent=2)}")
            if data.get('success') and 'data' in data and 'id' in data['data']:
                case_study_id = data['data']['id']
                print("✅ Case study creation working correctly")
                
                # Test getting all case studies
                get_response = requests.get(f"{BASE_URL}/case-studies", timeout=10)
                if get_response.status_code == 200:
                    get_data = get_response.json()
                    if get_data.get('success') and len(get_data.get('data', [])) > 0:
                        print("✅ GET /api/case-studies working correctly")
                    else:
                        print("❌ GET /api/case-studies returned no data")
                        return False
                else:
                    print(f"❌ GET /api/case-studies failed with status: {get_response.status_code}")
                    return False
                
                # Test updating case study
                update_data = {"title": "Updated Case Study Title"}
                put_response = requests.put(f"{BASE_URL}/case-studies/{case_study_id}", json=update_data, timeout=10)
                if put_response.status_code == 200:
                    put_data = put_response.json()
                    if put_data.get('success'):
                        print("✅ PUT /api/case-studies working correctly")
                    else:
                        print("❌ PUT /api/case-studies returned invalid response")
                        return False
                else:
                    print(f"❌ PUT /api/case-studies failed with status: {put_response.status_code}")
                    return False
                
                # Test deleting case study
                delete_response = requests.delete(f"{BASE_URL}/case-studies/{case_study_id}", timeout=10)
                if delete_response.status_code == 200:
                    delete_data = delete_response.json()
                    if delete_data.get('success'):
                        print("✅ DELETE /api/case-studies working correctly")
                    else:
                        print("❌ DELETE /api/case-studies returned invalid response")
                        return False
                else:
                    print(f"❌ DELETE /api/case-studies failed with status: {delete_response.status_code}")
                    return False
                
                return True
            else:
                print("❌ Case study creation API returned invalid response format")
                return False
        else:
            print(f"❌ Case study creation failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Case studies API failed with error: {e}")
        return False

def test_articles_api():
    """Test articles CRUD API"""
    print("\n🔍 Testing Articles CRUD API...")
    
    # Test creating article
    try:
        response = requests.post(f"{BASE_URL}/articles", json=TEST_ARTICLE, timeout=10)
        print(f"Create article - Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"Create Response: {json.dumps(data, indent=2)}")
            if data.get('success') and 'data' in data and 'id' in data['data']:
                article_id = data['data']['id']
                print("✅ Article creation working correctly")
                
                # Test getting all articles
                get_response = requests.get(f"{BASE_URL}/articles", timeout=10)
                if get_response.status_code == 200:
                    get_data = get_response.json()
                    if get_data.get('success') and len(get_data.get('data', [])) > 0:
                        print("✅ GET /api/articles working correctly")
                    else:
                        print("❌ GET /api/articles returned no data")
                        return False
                else:
                    print(f"❌ GET /api/articles failed with status: {get_response.status_code}")
                    return False
                
                # Test updating article
                update_data = {"title": "Updated Article Title", "content": "Updated content"}
                put_response = requests.put(f"{BASE_URL}/articles/{article_id}", json=update_data, timeout=10)
                if put_response.status_code == 200:
                    put_data = put_response.json()
                    if put_data.get('success'):
                        print("✅ PUT /api/articles working correctly")
                    else:
                        print("❌ PUT /api/articles returned invalid response")
                        return False
                else:
                    print(f"❌ PUT /api/articles failed with status: {put_response.status_code}")
                    return False
                
                # Test deleting article
                delete_response = requests.delete(f"{BASE_URL}/articles/{article_id}", timeout=10)
                if delete_response.status_code == 200:
                    delete_data = delete_response.json()
                    if delete_data.get('success'):
                        print("✅ DELETE /api/articles working correctly")
                    else:
                        print("❌ DELETE /api/articles returned invalid response")
                        return False
                else:
                    print(f"❌ DELETE /api/articles failed with status: {delete_response.status_code}")
                    return False
                
                return True
            else:
                print("❌ Article creation API returned invalid response format")
                return False
        else:
            print(f"❌ Article creation failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Articles API failed with error: {e}")
        return False

def test_consultations_api():
    """Test consultations booking API"""
    print("\n🔍 Testing Consultations Booking API...")
    
    # Test creating consultation
    try:
        response = requests.post(f"{BASE_URL}/consultations", json=TEST_CONSULTATION, timeout=10)
        print(f"Book consultation - Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"Create Response: {json.dumps(data, indent=2)}")
            if data.get('success') and 'data' in data and 'id' in data['data']:
                consultation_id = data['data']['id']
                print("✅ Consultation booking working correctly")
                
                # Test updating consultation status
                update_data = {"status": "confirmed"}
                put_response = requests.put(f"{BASE_URL}/consultations/{consultation_id}", json=update_data, timeout=10)
                if put_response.status_code == 200:
                    put_data = put_response.json()
                    if put_data.get('success'):
                        print("✅ PUT /api/consultations working correctly")
                    else:
                        print("❌ PUT /api/consultations returned invalid response")
                        return False
                else:
                    print(f"❌ PUT /api/consultations failed with status: {put_response.status_code}")
                    return False
                
                return True
            else:
                print("❌ Consultation booking API returned invalid response format")
                return False
        else:
            print(f"❌ Consultation booking failed with status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Consultations API failed with error: {e}")
        return False

def test_consultation_validation():
    """Test consultation validation"""
    print("\n🔍 Testing Consultation Validation...")
    
    # Test missing required fields
    invalid_data = {"name": "Test"}  # Missing required fields
    try:
        response = requests.post(f"{BASE_URL}/consultations", json=invalid_data, timeout=10)
        if response.status_code == 400:
            print("✅ Consultation validation working correctly")
            return True
        else:
            print(f"❌ Consultation validation failed - expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Consultation validation test failed with error: {e}")
        return False

def run_all_tests():
    """Run all backend tests"""
    print("🚀 Starting Backend API Tests for Business Consultant Website")
    print("=" * 60)
    
    results = {}
    
    # Test high priority APIs first (as per test_plan)
    results['health_check'] = test_health_check()
    results['contact_form'] = test_contact_form_api()
    results['contact_validation'] = test_contact_form_validation()
    results['newsletter'] = test_newsletter_api()
    
    # Test medium priority APIs
    results['case_studies'] = test_case_studies_api()
    results['articles'] = test_articles_api()
    results['consultations'] = test_consultations_api()
    results['consultation_validation'] = test_consultation_validation()
    
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend API is fully functional.")
    else:
        print(f"⚠️  {total - passed} test(s) failed. Please check the errors above.")
    
    return results

if __name__ == "__main__":
    run_all_tests()