
import os
import re

# Configuration
WORKSPACE_DIR = '/Users/mostafahussien/.gemini/antigravity/scratch/the-official-egyptian-real-estate-platform'
FOOTER_COMPONENT_PATH = os.path.join(WORKSPACE_DIR, 'components/footer.html')
EXCLUDE_DIRS = ['components', 'node_modules', '.git', 'assets', 'css', 'js']

def update_footer():
    # Read the new footer content
    try:
        with open(FOOTER_COMPONENT_PATH, 'r', encoding='utf-8') as f:
            new_footer_content = f.read()
    except FileNotFoundError:
        print(f"Error: Footer component not found at {FOOTER_COMPONENT_PATH}")
        return

    # Iterate through all HTML files
    for root, dirs, files in os.walk(WORKSPACE_DIR):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for file in files:
            if file.endswith('.html') and file != 'footer.html':
                file_path = os.path.join(root, file)
                print(f"Processing {file_path}...")

                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Regex to find the footer
                    # Look for <footer ... </footer> matching across lines
                    # We assume there is only one footer per page
                    footer_regex = re.compile(r'<footer\b[^>]*>.*?</footer>', re.DOTALL | re.IGNORECASE)
                    
                    if footer_regex.search(content):
                        new_content = footer_regex.sub(new_footer_content, content)
                        
                        # Write the updated content back
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"  Updated footer in {file}")
                    else:
                        print(f"  No footer found in {file}")

                except Exception as e:
                    print(f"  Error processing {file}: {e}")

if __name__ == "__main__":
    update_footer()
