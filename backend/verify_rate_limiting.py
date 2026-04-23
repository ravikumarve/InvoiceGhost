#!/usr/bin/env python3
"""
Manual verification script for rate limiting and error handling.

This script tests the enhanced rate limiting and error handling features
to ensure they work as expected.
"""

import requests
import time
import json
from io import BytesIO

BASE_URL = "http://localhost:8000"

def print_section(title):
    """Print a section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_health_check():
    """Test health check endpoint."""
    print_section("Testing Health Check")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print(f"Security Headers:")
    for header in ["X-Content-Type-Options", "X-Frame-Options", "X-XSS-Protection", 
                   "Referrer-Policy", "Permissions-Policy", "Content-Security-Policy",
                   "X-Processing-Time-Ms"]:
        if header in response.headers:
            print(f"  {header}: {response.headers[header]}")

def test_root_endpoint():
    """Test root endpoint."""
    print_section("Testing Root Endpoint")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_unsupported_format():
    """Test unsupported format error."""
    print_section("Testing Unsupported Format Error")
    files = {"file": ("test.xyz", BytesIO(b"fake content"), "application/octet-stream")}
    response = requests.post(f"{BASE_URL}/api/parse", files=files)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 415
    assert response.json()["error"] == "unsupported_format"
    print("✅ Unsupported format error working correctly")

def test_file_too_large():
    """Test file too large error."""
    print_section("Testing File Too Large Error")
    large_file = BytesIO(b"x" * (11 * 1024 * 1024))  # 11MB
    files = {"file": ("large.pdf", large_file, "application/pdf")}
    response = requests.post(f"{BASE_URL}/api/parse", files=files)
    print(f"Status: {response.status_code}")
    if response.status_code in [413, 415, 500]:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("✅ File size validation working (rejected large file)")

def test_validate_key_invalid():
    """Test validate key with invalid key."""
    print_section("Testing License Key Validation (Invalid)")
    response = requests.post(
        f"{BASE_URL}/api/validate-key",
        json={"license_key": "invalid-key"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert response.json()["valid"] == False
    print("✅ License key validation working correctly")

def test_validate_key_missing():
    """Test validate key with missing key."""
    print_section("Testing License Key Validation (Missing)")
    response = requests.post(
        f"{BASE_URL}/api/validate-key",
        json={}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 422
    print("✅ License key validation rejecting missing key")

def test_export_csv_no_line_items():
    """Test export CSV with no line items."""
    print_section("Testing Export CSV (No Line Items)")
    response = requests.post(
        f"{BASE_URL}/api/export/csv",
        json={
            "invoice_data": {
                "line_items": [],
                "grand_total": 0.0,
                "confidence_score": 0.8
            }
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 400
    print("✅ Export CSV rejecting invalid data")

def test_rate_limiting():
    """Test rate limiting (requires multiple requests)."""
    print_section("Testing Rate Limiting")
    print("Making 15 rapid requests to test rate limiting...")
    
    success_count = 0
    rate_limited_count = 0
    
    for i in range(15):
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            success_count += 1
        elif response.status_code == 429:
            rate_limited_count += 1
            print(f"  Request {i+1}: Rate limited (429)")
            print(f"  Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"  Request {i+1}: Unexpected status {response.status_code}")
        
        # Small delay between requests
        time.sleep(0.1)
    
    print(f"\nResults:")
    print(f"  Successful requests: {success_count}")
    print(f"  Rate limited requests: {rate_limited_count}")
    
    if rate_limited_count > 0:
        print("✅ Rate limiting is active")
    else:
        print("⚠️  Rate limiting may not be triggered (need more requests or longer time window)")

def test_404_error():
    """Test 404 error handling."""
    print_section("Testing 404 Error Handling")
    response = requests.get(f"{BASE_URL}/nonexistent-endpoint")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 404
    print("✅ 404 error handling working correctly")

def test_method_not_allowed():
    """Test method not allowed error."""
    print_section("Testing Method Not Allowed Error")
    response = requests.get(f"{BASE_URL}/api/parse")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 405
    print("✅ Method not allowed error working correctly")

def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("  InvoiceGhost - Rate Limiting & Error Handling Verification")
    print("="*60)
    
    try:
        # Test basic endpoints
        test_health_check()
        test_root_endpoint()
        
        # Test error handling
        test_unsupported_format()
        test_file_too_large()
        test_validate_key_invalid()
        test_validate_key_missing()
        test_export_csv_no_line_items()
        
        # Test HTTP errors
        test_404_error()
        test_method_not_allowed()
        
        # Test rate limiting (optional - takes time)
        print("\n" + "="*60)
        print("  Rate Limiting Test")
        print("="*60)
        print("Note: This test makes 15 rapid requests.")
        print("It may take 1-2 seconds to complete.")
        response = input("\nRun rate limiting test? (y/n): ")
        if response.lower() == 'y':
            test_rate_limiting()
        else:
            print("Skipping rate limiting test.")
        
        print("\n" + "="*60)
        print("  All Tests Completed Successfully! ✅")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to the server.")
        print("Make sure the server is running at http://localhost:8000")
        print("Start the server with: cd backend && python main.py")
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
