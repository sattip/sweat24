#!/usr/bin/env python3
"""
Generate a feature graphic for Google Play Console
Dimensions: 1024x500 pixels
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

# Create a new image with the required dimensions
width, height = 1024, 500
img = Image.new('RGB', (width, height), color='#1a1a1a')
draw = ImageDraw.Draw(img)

# Create gradient background
for y in range(height):
    # Gradient from dark to slightly lighter
    gradient_value = int(26 + (y / height) * 20)
    color = (gradient_value, gradient_value, gradient_value)
    draw.rectangle([(0, y), (width, y+1)], fill=color)

# Add red accent bars
accent_color = (239, 68, 68)
draw.rectangle([(0, 0), (width, 4)], fill=accent_color)
draw.rectangle([(0, height-4), (width, height)], fill=accent_color)

# Add diagonal accent overlay (semi-transparent red)
overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
overlay_draw = ImageDraw.Draw(overlay)

# Draw diagonal stripes
for x in range(-height, width+height, 100):
    points = [
        (x, 0),
        (x+50, 0),
        (x+height+50, height),
        (x+height, height)
    ]
    overlay_draw.polygon(points, fill=(239, 68, 68, 20))

# Composite the overlay
img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
draw = ImageDraw.Draw(img)

# Try to use system fonts
try:
    # Try different font paths for different systems
    font_paths = [
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/Avenir.ttc',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        'C:\\Windows\\Fonts\\arial.ttf',
    ]
    
    title_font = None
    subtitle_font = None
    
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                title_font = ImageFont.truetype(font_path, 48)
                subtitle_font = ImageFont.truetype(font_path, 28)
                break
            except:
                continue
    
    if not title_font:
        # Fallback to default font
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        
except:
    title_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()

# Load and resize logo if it exists
logo_path = 'public/logo-dark.png'
if os.path.exists(logo_path):
    logo = Image.open(logo_path)
    # Resize logo maintaining aspect ratio
    logo.thumbnail((200, 200), Image.Resampling.LANCZOS)
    # Calculate position to center logo
    logo_x = (width - logo.width) // 2
    logo_y = 100
    # Paste logo with transparency
    img.paste(logo, (logo_x, logo_y), logo if logo.mode == 'RGBA' else None)
    text_y_start = logo_y + logo.height + 40
else:
    text_y_start = 150

# Add text with shadow effect
def draw_text_with_shadow(draw, text, position, font, fill='white', shadow_color='black'):
    x, y = position
    # Draw shadow
    draw.text((x+2, y+2), text, font=font, fill=shadow_color)
    # Draw main text
    draw.text((x, y), text, font=font, fill=fill)

# Title text
title = "Your Fitness Journey Starts Here"
title_bbox = draw.textbbox((0, 0), title, font=title_font)
title_width = title_bbox[2] - title_bbox[0]
title_x = (width - title_width) // 2
draw_text_with_shadow(draw, title, (title_x, text_y_start), title_font, fill='white')

# Subtitle text
subtitle = "Personal Training • Group Classes • Nutrition"
subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
subtitle_x = (width - subtitle_width) // 2
draw_text_with_shadow(draw, subtitle, (subtitle_x, text_y_start + 60), subtitle_font, fill=accent_color)

# Add geometric shapes for modern look
# Top right square
draw.rectangle([(width-150, 50), (width-50, 150)], outline=accent_color, width=2)
# Bottom left circle
draw.ellipse([(50, height-150), (150, height-50)], outline=accent_color, width=2)
# Center left rectangle
draw.rectangle([(30, 200), (80, 300)], outline=(239, 68, 68, 128), width=2)

# Save the image
output_path = 'feature-graphic.png'
img.save(output_path, 'PNG', quality=95)
print(f"Feature graphic saved as {output_path}")
print(f"Dimensions: {width}x{height} pixels")
print("Ready for Google Play Console upload!")