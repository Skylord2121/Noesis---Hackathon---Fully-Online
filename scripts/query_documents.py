#!/usr/bin/env python3
"""
Query indexed documents for call center coaching
Can be used as a standalone script or imported as a module
"""

import os
import sys
import json
from pathlib import Path
from llama_index.core import VectorStoreIndex, StorageContext, load_index_from_storage, Settings
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding

# Configuration
OLLAMA_BASE_URL = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'qwen2.5:3b')
EMBEDDING_MODEL = 'nomic-embed-text'
INDEX_DIR = Path(__file__).parent.parent / '.index'

def setup_settings():
    """Configure LlamaIndex settings"""
    llm = Ollama(
        model=OLLAMA_MODEL,
        base_url=OLLAMA_BASE_URL,
        temperature=0.3,
        request_timeout=120.0
    )
    
    embed_model = OllamaEmbedding(
        model_name=EMBEDDING_MODEL,
        base_url=OLLAMA_BASE_URL
    )
    
    Settings.llm = llm
    Settings.embed_model = embed_model

def load_index():
    """Load previously created index from disk"""
    if not INDEX_DIR.exists():
        raise FileNotFoundError(
            f"Index not found at {INDEX_DIR}\n"
            "Run document_indexer.py first to create the index"
        )
    
    storage_context = StorageContext.from_defaults(persist_dir=str(INDEX_DIR))
    index = load_index_from_storage(storage_context)
    return index

def query_documents(query, top_k=3, return_sources=False):
    """
    Query the indexed documents
    
    Args:
        query: Question or search query
        top_k: Number of relevant chunks to retrieve
        return_sources: Whether to include source document info
    
    Returns:
        dict with 'response' and optionally 'sources'
    """
    setup_settings()
    index = load_index()
    
    query_engine = index.as_query_engine(
        similarity_top_k=top_k,
        response_mode="compact"
    )
    
    response = query_engine.query(query)
    
    result = {
        'response': str(response),
        'query': query
    }
    
    if return_sources and hasattr(response, 'source_nodes'):
        result['sources'] = []
        for node in response.source_nodes:
            result['sources'].append({
                'score': float(node.score),
                'text': node.text[:300] + '...' if len(node.text) > 300 else node.text,
                'metadata': node.metadata
            })
    
    return result

def main():
    """Interactive query mode"""
    print("=" * 60)
    print("🔍 Document Query Interface")
    print("=" * 60)
    
    try:
        setup_settings()
        index = load_index()
        print("✅ Index loaded successfully\n")
    except FileNotFoundError as e:
        print(f"❌ {e}")
        sys.exit(1)
    
    # Check for command line query
    if len(sys.argv) > 1:
        query = ' '.join(sys.argv[1:])
        print(f"Query: {query}\n")
        result = query_documents(query, return_sources=True)
        print(f"Response:\n{result['response']}\n")
        
        if result.get('sources'):
            print("\nSources:")
            for i, source in enumerate(result['sources'], 1):
                print(f"\n{i}. Relevance: {source['score']:.3f}")
                print(f"   {source['text']}")
        return
    
    # Interactive mode
    print("Enter queries (or 'quit' to exit):\n")
    
    query_engine = index.as_query_engine(
        similarity_top_k=3,
        response_mode="compact"
    )
    
    while True:
        try:
            query = input("\n💬 Query: ").strip()
            
            if query.lower() in ['quit', 'exit', 'q']:
                print("👋 Goodbye!")
                break
            
            if not query:
                continue
            
            print("\n🤔 Searching documents...")
            response = query_engine.query(query)
            print(f"\n📝 Response:\n{response}\n")
            
            if hasattr(response, 'source_nodes') and response.source_nodes:
                print("\n📚 Sources used:")
                for i, node in enumerate(response.source_nodes, 1):
                    print(f"  {i}. Relevance: {node.score:.3f}")
        
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")

if __name__ == '__main__':
    main()
