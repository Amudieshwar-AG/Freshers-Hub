import zlib
import struct
import math

def make_png(width, height, draw_func):
    # PNG signature
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR chunk
    ihdr_data = struct.pack('!IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png.extend(struct.pack('!I', len(ihdr_data)))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('!I', ihdr_crc))
    
    # IDAT chunk
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
            
    compressed = zlib.compress(raw_data, 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png.extend(struct.pack('!I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('!I', idat_crc))
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    png.extend(struct.pack('!I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('!I', iend_crc))
    
    return bytes(png)

def icon_drawer(x, y, w, h):
    # Orange gradient background (#F97316 to #EA580C)
    t = y / h
    r_bg = int(249 * (1 - t) + 234 * t)
    g_bg = int(115 * (1 - t) + 88 * t)
    b_bg = int(22 * (1 - t) + 12 * t)
    
    cx, cy = w / 2, h / 2
    dx = x - cx
    dy = y - cy
    dist = math.sqrt(dx*dx + dy*dy)
    
    # Outer rounded rectangle mask
    corner_radius = w * 0.22
    in_box = True
    if abs(dx) > (w/2 - corner_radius) and abs(dy) > (h/2 - corner_radius):
        cdx = abs(dx) - (w/2 - corner_radius)
        cdy = abs(dy) - (h/2 - corner_radius)
        if cdx*cdx + cdy*cdy > corner_radius*corner_radius:
            in_box = False
            
    if not in_box:
        return 0, 0, 0, 0
        
    # Draw White Cap / Rocket 'R' symbol in center
    # Top diamond (Cap)
    cap_y = cy - h * 0.1
    if abs(dy + h*0.08) < h*0.18 and abs(dx) < (h*0.18 - abs(dy + h*0.08))*1.8:
        return 255, 255, 255, 255
        
    # Cap base pillar
    if abs(dx) < w*0.08 and cy < y < cy + h*0.18:
        return 255, 255, 255, 255
        
    # Cap tassel line
    if w*0.18 < dx < w*0.25 and cy - h*0.05 < y < cy + h*0.12:
        return 255, 255, 255, 255
        
    return r_bg, g_bg, b_bg, 255

def maskable_drawer(x, y, w, h):
    # Full bleed background for maskable icon
    t = y / h
    r_bg = int(249 * (1 - t) + 234 * t)
    g_bg = int(115 * (1 - t) + 88 * t)
    b_bg = int(22 * (1 - t) + 12 * t)
    
    cx, cy = w / 2, h / 2
    dx = x - cx
    dy = y - cy
    
    # Draw White Cap in center (slightly scaled inside safe zone)
    if abs(dy + h*0.06) < h*0.14 and abs(dx) < (h*0.14 - abs(dy + h*0.06))*1.6:
        return 255, 255, 255, 255
        
    if abs(dx) < w*0.06 and cy < y < cy + h*0.14:
        return 255, 255, 255, 255
        
    return r_bg, g_bg, b_bg, 255

with open('public/pwa-192x192.png', 'wb') as f:
    f.write(make_png(192, 192, icon_drawer))

with open('public/pwa-512x512.png', 'wb') as f:
    f.write(make_png(512, 512, icon_drawer))

with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(make_png(180, 180, icon_drawer))

with open('public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(make_png(512, 512, maskable_drawer))

print("PWA icons generated successfully!")
