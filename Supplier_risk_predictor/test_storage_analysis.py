#!/usr/bin/env python3
"""
Test script for the storage analysis endpoints
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_storage_locations():
    """Test getting all storage locations"""
    print("Testing /api/storage-locations...")
    response = requests.get(f"{BASE_URL}/api/storage-locations")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Found {data['total_locations']} storage locations")
        print(f"First location: {data['locations'][0]['address']}")
        return True
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
        return False

def test_storage_location_by_id():
    """Test getting a specific storage location"""
    print("\nTesting /api/storage-location/1...")
    response = requests.get(f"{BASE_URL}/api/storage-location/1")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Location ID 1: {data['address']}")
        print(f"Items: {', '.join(data['items'])}")
        return True
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
        return False

def test_storage_demand_analysis():
    """Test the main storage demand analysis endpoint"""
    print("\nTesting /api/storage-demand-analysis...")
    print("This may take a while as it fetches news for each product category...")
    
    response = requests.get(f"{BASE_URL}/api/storage-demand-analysis")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Analyzed {len(data)} storage locations")
        
        # Show sample results for first location
        if data:
            first_location = data[0]
            print(f"\nSample Analysis for Location {first_location['location_id']}:")
            print(f"Address: {first_location['address']}")
            print(f"Overall Sentiment: {first_location['overall_location_sentiment']}")
            print(f"Average Polarity Score: {first_location['average_polarity_score']:.3f}")
            
            print("\nDemand Predictions:")
            for prediction in first_location['demand_predictions']:
                print(f"  • {prediction['product_category']}: {prediction['demand_trend']} "
                      f"({prediction['sentiment']}, confidence: {prediction['confidence']})")
        
        return True
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing Storage Analysis API Endpoints")
    print("=" * 50)
    
    # Test basic endpoints first
    test_storage_locations()
    test_storage_location_by_id()
    
    # Test the main analysis endpoint
    test_storage_demand_analysis()
    
    print("\n" + "=" * 50)
    print("✅ All tests completed!")
    print("\nNote: Check the 'output/storage_demand_analysis.json' file for detailed results.")

if __name__ == "__main__":
    main() 