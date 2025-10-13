"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, ExternalLink, Mail, Eye, EyeOff, Copy, Check, Clock } from "lucide-react";
import { useState } from "react";

interface AdvancedMetadataDisplayProps {
  metadata: Record<string, any> | null;
  title?: string;
  showCount?: boolean;
  className?: string;
  createdAt?: string;
}

export function AdvancedMetadataDisplay({ 
  metadata, 
  title = "Metadata", 
  showCount = true,
  className = "",
  createdAt
}: AdvancedMetadataDisplayProps) {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle different metadata formats
  let parsedMetadata: Record<string, any> = {};
  let isCharacterArray = false;
  
  if (metadata) {
    if (typeof metadata === 'string') {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        // If it's not valid JSON, treat as a single value
        parsedMetadata = { 'value': metadata };
      }
    } else if (Array.isArray(metadata)) {
      // Check if it's an array of individual characters
      if (metadata.length > 0 && typeof metadata[0] === 'string' && metadata[0].length === 1) {
        isCharacterArray = true;
        // Try to reconstruct the original string
        const reconstructedString = metadata.join('');
        try {
          parsedMetadata = JSON.parse(reconstructedString);
        } catch (e) {
          parsedMetadata = { 'reconstructed_string': reconstructedString };
        }
      } else {
        // Regular array, convert to object with index keys
        parsedMetadata = metadata.reduce((acc, item, index) => {
          acc[`item_${index}`] = item;
          return acc;
        }, {} as Record<string, any>);
      }
    } else if (typeof metadata === 'object') {
      parsedMetadata = metadata;
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!parsedMetadata || Object.keys(parsedMetadata).length === 0) {
    return (
      <Card className={`border-l-4 border-l-gray-300 ${className}`}>
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <Settings className="w-5 h-5 text-gray-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No metadata available</p>
            <p className="text-sm text-gray-400 mt-1">
              No custom metadata has been configured.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Created At Card */}
      {createdAt && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="text-lg font-semibold text-gray-900">{createdAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Separator */}
      <div className="my-4 border-t border-gray-200"></div>
      
      {/* Metadata Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {Object.entries(parsedMetadata).map(([key, value], index) => {
              // Parse JSON string if needed
              let displayValue = value;
              let valueType = typeof value;
              let isJsonString = false;
              
              if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                try {
                  displayValue = JSON.parse(value);
                  valueType = 'object';
                  isJsonString = true;
                } catch (e) {
                  // Keep as string if not valid JSON
                }
              }

              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {key.replace(/_/g, ' ').replace(/item\s+/g, 'Item ')}:
                  </span>
                  <span className="text-sm text-gray-900 font-medium">
                    {valueType === 'object' ? (
                      JSON.stringify(displayValue)
                    ) : typeof displayValue === 'string' && displayValue.includes('@') ? (
                      <a
                        href={`mailto:${displayValue}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {displayValue}
                      </a>
                    ) : typeof displayValue === 'string' && displayValue.startsWith('http') ? (
                      <a
                        href={displayValue}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {displayValue}
                      </a>
                    ) : typeof displayValue === 'boolean' ? (
                      displayValue ? 'True' : 'False'
                    ) : (
                      String(displayValue)
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
