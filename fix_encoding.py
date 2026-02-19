import re

# Read the fixed file
with open(r'd:\appointmentstd2\appointmentstd2\stdapp2\src\lib\db_fixed.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace HTML entities
content = content.replace('&lt;', '<')
content = content.replace('&gt;', '>')
content = content.replace('&amp;', '&')
content = content.replace('=&gt;', '=>')
content = content.replace('=& gt;', '=>')
content = content.replace('& lt;', '<')
content = content.replace('& gt;', '>')
content = content.replace('& amp;', '&')

# Write to db.ts
with open(r'd:\appointmentstd2\appointmentstd2\stdapp2\src\lib\db.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("File fixed successfully!")
