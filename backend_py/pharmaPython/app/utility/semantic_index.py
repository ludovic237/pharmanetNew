import faiss


class SemanticIndex:
  def __init__(self, dim):
    self.index = faiss.IndexFlatL2(dim)

  def add(self, vectors):
    self.index.add(vectors)

  def search(self, query, k=5):
    return self.index.search(query, k)
