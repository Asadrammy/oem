"use client";

import React from "react";
import { AdvancedMetadataDisplay } from "./advanced-metadata-display";

// Demo data showing different metadata formats
const demoMetadata = {
  // Normal key-value pairs
  "company_name": "ACME Corp",
  "billing_reference": "ACME-2024-001",
  "contact_email": "billing@acme.com",
  "website": "https://acme.com",
  "is_premium": true,
  "max_vehicles": 100,
  
  // JSON string that should be parsed
  "settings": '{"theme": "dark", "notifications": true, "auto_save": false}',
  
  // Nested object
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001"
  },
  
  // Array data
  "features": ["GPS", "Telemetry", "Alerts", "Reports"]
};

// Character array simulation (what you're seeing)
const characterArrayMetadata = [
  '{', '"', 'm', 'a', 'x', '_', 'v', 'e', 'h', 'i', 'c', 'l', 'e', 's', '"', ':', ' ', '1', '0', '0', ',', ' ', '"', 'c', 'o', 'm', 'p', 'a', 'n', 'y', '"', ':', ' ', '"', 'A', 'C', 'M', 'E', '"', '}'
];

export function MetadataDemo() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Metadata Display Demo</h2>
        <p className="text-gray-600 mb-6">
          This shows how different metadata formats are displayed with the new component.
        </p>
      </div>

      {/* Normal metadata */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-green-700">✅ Normal Metadata (Object)</h3>
        <AdvancedMetadataDisplay 
          metadata={demoMetadata} 
          title="Demo Metadata"
          showCount={true}
        />
      </div>

      {/* Character array metadata */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-red-700">⚠️ Character Array Metadata (Your Current Issue)</h3>
        <AdvancedMetadataDisplay 
          metadata={characterArrayMetadata} 
          title="Character Array Metadata"
          showCount={true}
        />
      </div>

      {/* JSON string metadata */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-blue-700">📄 JSON String Metadata</h3>
        <AdvancedMetadataDisplay 
          metadata='{"name": "Test", "value": 123, "active": true}' 
          title="JSON String Metadata"
          showCount={true}
        />
      </div>
    </div>
  );
}
