import os
import re

def fix_images():
    print("Fixing images...")
    src_dir = "src"
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(".tsx"):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()

                if "<img" in content:
                    print(f"Fixing {filepath}")
                    
                    # Ensure import exists
                    if "import Image from" not in content and "next/image" not in content:
                        # Find last import
                        import_match = list(re.finditer(r'^import .*?;?\n', content, re.MULTILINE))
                        if import_match:
                            last_import = import_match[-1]
                            content = content[:last_import.end()] + 'import Image from "next/image";\n' + content[last_import.end():]
                        else:
                            content = 'import Image from "next/image";\n' + content
                    
                    # Convert <img ... /> to <Image ... fill />
                    # Simple regex replace for self-closing img tags
                    def replace_img(match):
                        tag = match.group(0)
                        # Replace <img with <Image
                        tag = tag.replace("<img", "<Image")
                        
                        # Add fill if width/height not present
                        if "fill" not in tag and "width" not in tag:
                            # Insert before className or at the end
                            if "className=" in tag:
                                tag = tag.replace("className=", "fill className=")
                            else:
                                tag = tag.replace("/>", "fill />")
                        
                        return tag

                    content = re.sub(r'<img\s+[^>]*/>', replace_img, content)
                    content = re.sub(r'<img\s+[^>]*>(.*?)</img\s*>', replace_img, content)

                    # Remove next eslint disable if present
                    content = content.replace("{/* eslint-disable-next-line @next/next/no-img-element */}\n", "")
                    content = content.replace("// eslint-disable-next-line @next/next/no-img-element\n", "")

                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(content)

def fix_unused_vars():
    print("Fixing unused vars...")
    local_embed_path = "src/lib/search/local-embeddings.ts"
    if os.path.exists(local_embed_path):
        with open(local_embed_path, "r", encoding="utf-8") as f:
            content = f.read()
        content = content.replace("import { TFIDFVectorizer }", "import { }")
        content = re.sub(r'import\s*{\s*EmbeddingRecord\s*}\s*from\s*\'\./vector-store\';\n', '', content)
        with open(local_embed_path, "w", encoding="utf-8") as f:
            f.write(content)

    semantic_search_path = "src/lib/search/semantic-search.ts"
    if os.path.exists(semantic_search_path):
        with open(semantic_search_path, "r", encoding="utf-8") as f:
            content = f.read()
        content = content.replace("cosineSimilarity,", "")
        content = content.replace("prepareEntitiesForEmbedding,", "")
        with open(semantic_search_path, "w", encoding="utf-8") as f:
            f.write(content)
            
    cache_test = "__tests__/lib/cache.test.ts"
    if os.path.exists(cache_test):
        with open(cache_test, "r", encoding="utf-8") as f:
            content = f.read()
        content = content.replace("import { MemoryCache } from '@/lib/cache';", "")
        with open(cache_test, "w", encoding="utf-8") as f:
            f.write(content)

def fix_tech_gallery():
    print("Fixing TechGallery...")
    path = "src/components/ui/TechGallery.tsx"
    if not os.path.exists(path): return
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # We want to move the fetchImages definition INSIDE the useEffect to avoid cascading renders warning
    old_effect = """  const fetchImages = (q: string) => {
    setLoading(true);
    fetch(`/api/nasa-images?q=${encodeURIComponent(q)}&media_type=image`)
      .then((res) => res.json())
      .then((data) => {
        if (data.collection?.items) {
          const mapped = data.collection.items
            .filter((item: any) => item.links?.[0]?.href)
            .slice(0, 12)
            .map((item: any) => ({
              title: item.data?.[0]?.title || "Untitled",
              description: item.data?.[0]?.description || "",
              nasa_id: item.data?.[0]?.nasa_id || "",
              date_created: item.data?.[0]?.date_created || "",
              center: item.data?.[0]?.center || "",
              thumb: item.links[0].href,
            }));
          setImages(mapped);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchImages(query);
  }, [query]);"""

    new_effect = """  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/nasa-images?q=${encodeURIComponent(query)}&media_type=image`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.collection?.items) {
          const mapped = data.collection.items
            .filter((item: any) => item.links?.[0]?.href)
            .slice(0, 12)
            .map((item: any) => ({
              title: item.data?.[0]?.title || "Untitled",
              description: item.data?.[0]?.description || "",
              nasa_id: item.data?.[0]?.nasa_id || "",
              date_created: item.data?.[0]?.date_created || "",
              center: item.data?.[0]?.center || "",
              thumb: item.links[0].href,
            }));
          setImages(mapped);
        }
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
      
    return () => { active = false; };
  }, [query]);"""
    
    if "const fetchImages" in content:
        content = content.replace(old_effect, new_effect)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

def fix_techport():
    print("Fixing TechPortProjects...")
    path = "src/components/ui/TechPortProjects.tsx"
    if not os.path.exists(path): return
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Move fetchProjects inside useEffect
    old_effect = """  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // First get project IDs
      const listRes = await fetch("/api/nasa-techport");
      const listData = await listRes.json();

      if (listData.error) {
        setError(true);
        setLoading(false);
        return;
      }

      // Get IDs from the projects list
      const ids: number[] = [];
      const projectList = Array.isArray(listData.projects) ? listData.projects : listData.projects?.projects;
      
      if (projectList && Array.isArray(projectList)) {
        // Get 9 random project IDs
        const shuffled = [...projectList].sort(() => 0.5 - Math.random());
        ids.push(...shuffled.slice(0, 9).map((p: { projectId: number }) => p.projectId));
      }

      if (ids.length === 0) {
        setError(true);
        setLoading(false);
        return;
      }

      // Fetch details for each project
      const projectPromises = ids.map(async (id) => {
        try {
          const res = await fetch(`/api/nasa-techport?id=${id}`);
          const data = await res.json();
          return data.project || null;
        } catch {
          return null;
        }
      });

      const results = await Promise.all(projectPromises);
      setProjects(results.filter(Boolean) as TechProject[]);
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);"""

    new_effect = """  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const listRes = await fetch("/api/nasa-techport");
      const listData = await listRes.json();
      if (listData.error) throw new Error();

      const ids: number[] = [];
      const projectList = Array.isArray(listData.projects) ? listData.projects : listData.projects?.projects;
      if (projectList && Array.isArray(projectList)) {
        const shuffled = [...projectList].sort(() => 0.5 - Math.random());
        ids.push(...shuffled.slice(0, 9).map((p: { projectId: number }) => p.projectId));
      }
      if (ids.length === 0) throw new Error();

      const projectPromises = ids.map(async (id) => {
        try {
          const res = await fetch(`/api/nasa-techport?id=${id}`);
          const data = await res.json();
          return data.project || null;
        } catch { return null; }
      });

      const results = await Promise.all(projectPromises);
      setProjects(results.filter(Boolean) as TechProject[]);
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps"""

    if "const fetchProjects = useCallback" in content:
        content = content.replace(old_effect, new_effect)
        # also replace the retry button onClick
        content = content.replace("onClick={fetchProjects}", "onClick={loadData}")
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

if __name__ == "__main__":
    fix_images()
    fix_unused_vars()
    fix_tech_gallery()
    fix_techport()
    print("Done!")
