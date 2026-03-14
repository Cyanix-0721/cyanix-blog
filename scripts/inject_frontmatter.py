import os
import sys
import re
from datetime import datetime


def inject_frontmatter(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if not (file.endswith(".md") or file.endswith(".mdx")):
                continue

            file_path = os.path.join(root, file)

            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            has_frontmatter = False
            frontmatter_content = ""
            body_content = content

            # Check if it has a frontmatter block
            if content.startswith("---\n") or content.startswith("---\r\n"):
                # Find the end of the frontmatter using regex
                match = re.search(r"^---\r?\n(.*?)\r?\n---\r?\n", content, re.DOTALL)
                if match:
                    has_frontmatter = True
                    frontmatter_content = match.group(1)
                    body_content = content[match.end() :]

            has_title = False
            has_date = False

            if has_frontmatter:
                # Simple check if title or date exists (case-insensitive and allowing spaces)
                has_title = bool(
                    re.search(
                        r"^title\s*:", frontmatter_content, re.MULTILINE | re.IGNORECASE
                    )
                )
                has_date = bool(
                    re.search(
                        r"^date\s*:", frontmatter_content, re.MULTILINE | re.IGNORECASE
                    )
                )

            # If both exist, do nothing
            if has_title and has_date:
                continue

            # What needs to be added:
            lines_to_add = []

            if not has_title:
                # 1. Fallback to filename
                title = os.path.splitext(file)[0]

                # 2. Try to find the first H1 in the markdown body
                # Matches at the start of a line, or after a newline, followed by one #, then space, then text
                h1_match = re.search(
                    r"^(?:#\s+)(?P<title>.+)$", body_content, re.MULTILINE
                )
                if h1_match:
                    extracted_title = h1_match.group("title").strip()
                    # Optional: Handle markdown links like '# [Title](url)' by stripping the link syntax
                    link_match = re.match(r"^\[(.*?)\]\(.*?\)$", extracted_title)
                    if link_match:
                        title = link_match.group(1).strip()
                    else:
                        title = extracted_title

                # Make sure to escape double quotes in the title if they exist
                title = title.replace('"', '\\"')
                lines_to_add.append(f'title: "{title}"')

            if not has_date:
                # Get modified time (local time of the machine running the script)
                mtime = os.path.getmtime(file_path)
                date_str = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")
                lines_to_add.append(f"date: {date_str}")

            if has_frontmatter:
                # Append missing lines to existing frontmatter
                new_frontmatter = frontmatter_content
                if new_frontmatter and not new_frontmatter.endswith("\n"):
                    new_frontmatter += "\n"
                new_frontmatter += "\n".join(lines_to_add) + "\n"
                # Reconstruct file content
                new_content = f"---\n{new_frontmatter}---\n{body_content}"
            else:
                # Create brand new frontmatter block
                new_frontmatter = "\n".join(lines_to_add) + "\n"
                if not body_content.startswith("\n"):
                    body_content = "\n" + body_content
                new_content = f"---\n{new_frontmatter}---{body_content}"

            # Write changes to the file
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)

            print(
                f"Injected missing info (title={not has_title}, date={not has_date}) into: {file_path}"
            )


if __name__ == "__main__":
    # If a directory argument is provided, use it; otherwise default to src/content/posts
    if len(sys.argv) > 1:
        posts_dir = sys.argv[1]
    else:
        # We are running from the root of the repository by default
        posts_dir = os.path.join(os.getcwd(), "src", "content", "posts")

    print(f"Starting frontmatter injection in: {posts_dir}")
    if os.path.exists(posts_dir):
        inject_frontmatter(posts_dir)
        print("Frontmatter injection completed.")
    else:
        print(f"Directory not found: {posts_dir}")
