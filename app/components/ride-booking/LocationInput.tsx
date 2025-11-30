import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  locationService,
  type LocationSuggestion,
} from "~/lib/locationService";
import { cn } from "~/lib/utils";

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: LocationSuggestion) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function LocationInput({
  label,
  placeholder,
  value,
  onChange,
  onLocationSelect,
  className,
  required = false,
  disabled = false,
  icon,
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await locationService.searchLocations(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Location search error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search by 300ms
    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: LocationSuggestion) => {
    onChange(suggestion.address);
    setShowSuggestions(false);
    setSuggestions([]);

    // Get detailed location info if placeId exists and it's not a fallback
    if (suggestion.placeId && !suggestion.placeId.startsWith("fallback_")) {
      try {
        const detailedLocation = await locationService.getLocationDetails(
          suggestion.placeId
        );
        if (detailedLocation) {
          onLocationSelect(detailedLocation);
        } else {
          onLocationSelect(suggestion);
        }
      } catch (error) {
        console.error("Error getting location details:", error);
        onLocationSelect(suggestion);
      }
    } else {
      onLocationSelect(suggestion);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle blur (with delay to allow clicking suggestions)
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Clear input
  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Label */}
      <Label
        htmlFor={`location-${label}`}
        className="text-sm font-medium text-gray-700 mb-2 block"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* Input Container */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors">
          {/* Icon */}
          {icon || <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />}

          {/* Input */}
          <Input
            ref={inputRef}
            id={`location-${label}`}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className="border-0 focus-visible:ring-0 px-0 bg-transparent flex-1"
            autoComplete="off"
          />

          {/* Loading Indicator */}
          {isLoading && (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
          )}

          {/* Clear Button */}
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-muted transition-colors flex-shrink-0"
              aria-label="Clear input"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto mt-1"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.placeId}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className={cn(
                  "w-full text-left p-3 hover:bg-muted border-b border-border last:border-b-0 transition-colors",
                  selectedIndex === index && "bg-muted"
                )}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {suggestion.address}
                    </div>
                    {suggestion.city && (
                      <div className="text-sm text-muted-foreground truncate">
                        {suggestion.city}
                        {suggestion.region && `, ${suggestion.region}`}
                      </div>
                    )}
                    {/* Location Type Badge */}
                    {suggestion.types.includes("airport") && (
                      <div className="inline-flex items-center gap-1 mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          ✈️ Airport
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Powered by Google */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="text-xs text-gray-400 mt-1 text-right">
          Powered by Google
        </div>
      )}
    </div>
  );
}

export default LocationInput;
