#!/usr/bin/env python3
"""
LlamaIndex Document Indexer for Company Knowledge Base
Indexes documents and provides RAG (Retrieval-Augmented Generation)
"""

import os
import sys
from pathlib import Path
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding

# Configuration
OLLAMA_BASE_URL = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'qwen2.5:3b')
EMBEDDING_MODEL = 'nomic-embed-text'  # Lightweight embedding model
DOCS_DIR = Path(__file__).parent.parent / 'company-docs'
INDEX_DIR = Path(__file__).parent.parent / '.index'

def setup_llama_index():
    """Configure LlamaIndex with Ollama"""
    print(f"🔧 Setting up LlamaIndex with Ollama at {OLLAMA_BASE_URL}")
    
    # Set up Ollama LLM
    llm = Ollama(
        model=OLLAMA_MODEL,
        base_url=OLLAMA_BASE_URL,
        temperature=0.3,  # Lower for factual responses
        request_timeout=120.0
    )
    
    # Set up Ollama embeddings
    embed_model = OllamaEmbedding(
        model_name=EMBEDDING_MODEL,
        base_url=OLLAMA_BASE_URL
    )
    
    # Configure global settings
    Settings.llm = llm
    Settings.embed_model = embed_model
    Settings.chunk_size = 512  # Smaller chunks for better retrieval
    Settings.chunk_overlap = 50
    
    print("✅ LlamaIndex configured with Ollama")
    return llm, embed_model

def check_embedding_model():
    """Check if embedding model is available, pull if not"""
    import subprocess
    import shutil
    
    # Skip check if ollama CLI not available (e.g., in sandbox environment)
    if not shutil.which('ollama'):
        print(f"\n⚠️  Ollama CLI not found - skipping model check")
        print(f"   Make sure {EMBEDDING_MODEL} is available on your Ollama server")
        return
    
    print(f"\n📦 Checking for embedding model: {EMBEDDING_MODEL}")
    result = subprocess.run(
        ['ollama', 'list'],
        capture_output=True,
        text=True
    )
    
    if EMBEDDING_MODEL not in result.stdout:
        print(f"⬇️  Pulling {EMBEDDING_MODEL} model...")
        subprocess.run(['ollama', 'pull', EMBEDDING_MODEL], check=True)
        print(f"✅ {EMBEDDING_MODEL} model ready")
    else:
        print(f"✅ {EMBEDDING_MODEL} model already available")

def index_documents():
    """Load and index all documents from company-docs directory"""
    print(f"\n📂 Loading documents from: {DOCS_DIR}")
    
    if not DOCS_DIR.exists():
        print(f"❌ Directory not found: {DOCS_DIR}")
        print(f"   Creating directory...")
        DOCS_DIR.mkdir(parents=True, exist_ok=True)
        return None
    
    # Check for documents
    docs_list = list(DOCS_DIR.glob('**/*'))
    docs_list = [d for d in docs_list if d.is_file() and not d.name.startswith('.')]
    
    if not docs_list:
        print("⚠️  No documents found in company-docs/")
        print("   Add .txt, .pdf, .md files to the directory and run again")
        return None
    
    print(f"📄 Found {len(docs_list)} document(s):")
    for doc in docs_list:
        print(f"   - {doc.name} ({doc.stat().st_size / 1024:.1f} KB)")
    
    # Load documents
    print("\n📖 Loading and parsing documents...")
    try:
        documents = SimpleDirectoryReader(
            str(DOCS_DIR),
            recursive=True,
            required_exts=['.txt', '.pdf', '.md', '.doc', '.docx']
        ).load_data()
        
        print(f"✅ Loaded {len(documents)} document(s)")
    except Exception as e:
        print(f"❌ Error loading documents: {e}")
        return None
    
    # Create index
    print("\n🔨 Creating vector index...")
    try:
        index = VectorStoreIndex.from_documents(documents)
        print("✅ Index created successfully")
        
        # Persist index to disk
        print(f"\n💾 Saving index to: {INDEX_DIR}")
        INDEX_DIR.mkdir(parents=True, exist_ok=True)
        index.storage_context.persist(persist_dir=str(INDEX_DIR))
        print("✅ Index saved to disk")
        
        return index
    except Exception as e:
        print(f"❌ Error creating index: {e}")
        return None

def test_query(index, query="What are the company's customer service policies?"):
    """Test the indexed documents with a sample query"""
    if not index:
        print("\n⚠️  No index available for testing")
        return
    
    print(f"\n🔍 Testing query: '{query}'")
    print("-" * 60)
    
    try:
        query_engine = index.as_query_engine(
            similarity_top_k=3,  # Return top 3 most relevant chunks
            response_mode="compact"
        )
        
        response = query_engine.query(query)
        print(f"\n📝 Response:\n{response}")
        print("\n" + "=" * 60)
        
        # Show source nodes (which documents were used)
        if hasattr(response, 'source_nodes'):
            print("\n📚 Sources:")
            for i, node in enumerate(response.source_nodes, 1):
                print(f"\n{i}. Score: {node.score:.3f}")
                print(f"   Text: {node.text[:200]}...")
    except Exception as e:
        print(f"❌ Query error: {e}")

def main():
    """Main indexing workflow"""
    print("=" * 60)
    print("🚀 LlamaIndex Document Indexer for Call Center Coaching")
    print("=" * 60)
    
    # Step 1: Check embedding model
    check_embedding_model()
    
    # Step 2: Setup LlamaIndex
    setup_llama_index()
    
    # Step 3: Index documents
    index = index_documents()
    
    # Step 4: Test query
    if index:
        test_query(index, "What should agents say when a customer is angry?")
    
    print("\n" + "=" * 60)
    print("✅ Indexing complete!")
    print("=" * 60)
    print("\n💡 Next steps:")
    print("   1. Add more documents to company-docs/")
    print("   2. Run this script again to re-index")
    print("   3. Use query_documents.py to search indexed content")
    print("   4. Integrate with dashboard API endpoint")

if __name__ == '__main__':
    main()
