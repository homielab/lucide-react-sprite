import React, { useState, useEffect } from 'react';

type CustomIconProps = {
  name: string;
  size?: number;
  color?: string;
} & React.SVGProps<SVGSVGElement>; // Change to SVGProps as it now renders an SVG

interface SvgData {
  attributes: Record<string, string>;
  innerContent: string;
}

// Helper function to convert kebab-case to camelCase
const kebabToCamelCase = (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

export const CustomIcon = ({ name, size = 24, color = 'currentColor', ...props }: CustomIconProps) => {
  const [svgData, setSvgData] = useState<SvgData | null>(null);

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        const response = await fetch(`/custom-icons/${name}.svg`);
        if (response.ok) {
          const svgText = await response.text();
          const attributes: Record<string, string> = {};
          const attributeString = svgText.match(/<svg([^>]*)>/)?.[1] || '';
          
          attributeString.replace(/([\w-]+)="([^"]*)"/g, (_, key, value) => {
            if (key !== 'width' && key !== 'height') { // We control these via props
              attributes[kebabToCamelCase(key)] = value; // Convert key to camelCase
            }
            return '';
          });

          const innerContent = svgText.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)?.[1] || svgText;
          setSvgData({ attributes, innerContent });

        } else {
          console.error(`Failed to fetch custom icon: /custom-icons/${name}.svg`);
          setSvgData(null);
        }
      } catch (error) {
        console.error(`Error fetching custom icon /custom-icons/${name}.svg:`, error);
        setSvgData(null);
      }
    };

    fetchSvg();
  }, [name]);

  if (!svgData) {
    return <svg width={size} height={size} {...props} />; // Render an empty SVG placeholder
  }

  return (
    <svg
      width={size}
      height={size}
      color={color}
      {...svgData.attributes} // Spread the original SVG's attributes
      aria-hidden="true" // Mark as decorative
      dangerouslySetInnerHTML={{ __html: svgData.innerContent }}
      data-testid="custom-icon-dev" // Add test ID for dev version
      {...props} // Allow overriding attributes via props
    />
  );
};
