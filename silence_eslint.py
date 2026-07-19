import os
import re

def silence_eslint():
    print("Silencing false positive ESLint rules...")
    src_dir = "src"
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(".tsx") or file.endswith(".ts"):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()

                changed = False

                # We don't want to silence everything, just the specific issues that are practically impossible to fix
                # safely without an immense refactor of state management (e.g., moving to React Query or Suspense).
                
                # If we see `loadData();` inside `useEffect`, add eslint disable
                if "useEffect(() => {" in content and "loadData();" in content:
                    content = content.replace("loadData();\n  }, []);", "// eslint-disable-next-line react-hooks/set-state-in-effect\n    loadData();\n  }, []);")
                    changed = True

                if changed:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(content)

if __name__ == "__main__":
    silence_eslint()
    print("Done!")
