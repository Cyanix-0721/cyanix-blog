const POSTS_PATH_SEGMENT = `${"src"}${"/"}${"content"}${"/"}${"posts"}${"/"}`;

function normalizePath(pathname: string) {
  return pathname.replace(/\\/g, "/");
}

type HastRootLike = {
  children: Array<any>;
};

const rehypeStripLeadingH1 = () => {
  return (tree: HastRootLike, file: any) => {
    const filePath = normalizePath(String(file.path || ""));
    if (!filePath.includes(POSTS_PATH_SEGMENT)) return;

    for (let i = 0; i < tree.children.length; i += 1) {
      const node = tree.children[i];

      if (node.type === "text" && !node.value.trim()) continue;
      if (node.type === "comment") continue;

      if (node.type === "element" && node.tagName === "h1") {
        tree.children.splice(i, 1);
      }
      break;
    }
  };
};

export default rehypeStripLeadingH1;
