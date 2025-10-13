"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, ExternalLink, Mail } from "lucide-react";

interface MetadataDisplayProps {
  metadata: Record<string, any> | null;
  title?: string;
  showCount?: boolean;
  className?: string;
}

export function MetadataDisplay({ 
  metadata, 
  title = "Metadata", 
  showCount = true,
  className = ""
}: MetadataDisplayProps) {
  // Handle different metadata formats
  let parsedMetadata: Record<string, any> = {};
  
  if (metadata) {
    if (typeof metadata === 'string') {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        // If it's not valid JSON, treat as a single value
        parsedMetadata = { 'value': metadata };
      }
    } else if (Array.isArray(metadata)) {
      // If it's an array, convert to object with index keys
      parsedMetadata = metadata.reduce((acc, item, index) => {
        acc[`item_${index}`] = item;
        return acc;
      }, {} as Record<string, any>);
    } else if (typeof metadata === 'object') {
      parsedMetadata = metadata;
    }
  }

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
    <Card className={`border-l-4 border-l-blue-500 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Settings className="w-5 h-5 text-blue-600" />
          {title}
          {showCount && (
            <Badge variant="secondary" className="ml-auto">
              {Object.keys(parsedMetadata).length} attributes
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            
            // Get appropriate icon based on value type
            const getValueIcon = (type: string) => {
              switch (type) {
                case 'object': return '📋';
                case 'string': return '📝';
                case 'number': return '🔢';
                case 'boolean': return '✅';
                default: return '📄';
              }
            };

            return (
              <div 
                key={key} 
                className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-400 hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                    <span className="text-lg">{getValueIcon(valueType)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-semibold text-gray-800 capitalize truncate">
                        {key.replace(/_/g, ' ').replace(/item\s+/g, 'Item ')}
                      </p>
                      <Badge 
                        variant={valueType === 'object' ? 'default' : 'secondary'}
                        className="text-xs px-2 py-1 font-medium"
                      >
                        {valueType}
                      </Badge>
                    </div>
                    <div className="text-gray-900">
                      {valueType === 'object' ? (
                        <div className="space-y-2">
                          <pre className="text-xs bg-gray-50 p-3 rounded-lg border overflow-x-auto max-h-40 font-mono">
                            {JSON.stringify(displayValue, null, 2)}
                          </pre>
                          {isJsonString && (
                            <p className="text-xs text-gray-500 italic">
                              Parsed from JSON string
                            </p>
                          )}
                        </div>
                      ) : typeof displayValue === 'string' && displayValue.includes('@') ? (
                        <a
                          href={`mailto:${displayValue}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          {displayValue}
                        </a>
                      ) : typeof displayValue === 'string' && displayValue.startsWith('http') ? (
                        <a
                          href={displayValue}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {displayValue}
                        </a>
                      ) : typeof displayValue === 'boolean' ? (
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${displayValue ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="font-medium">
                            {displayValue ? 'True' : 'False'}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium break-words text-gray-800">
                          {String(displayValue)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
