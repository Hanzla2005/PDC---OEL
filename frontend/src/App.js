import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const SOLR_URL = 'http://localhost:4000/solr/students/select';
const ROWS = 3;

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [facets, setFacets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState({});

  const search = useCallback(async (q, p, dept, s) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: q || '*:*',
        rows: ROWS,
        start: p * ROWS,
        facet: true,
        'facet.field': 'department',
        hl: true,
        'hl.fl': 'name',
        wt: 'json',
      });
      if (dept) params.append('fq', `department:"${dept}"`);
      if (s) params.append('sort', s);

      const res = await fetch(`${SOLR_URL}?${params}`);
      const data = await res.json();

      setResults(data.response.docs);
      setTotal(data.response.numFound);
      setHighlight(data.highlighting || {});

      const rawFacets = data.facet_counts?.facet_fields?.department || [];
      const parsed = [];
      for (let i = 0; i < rawFacets.length; i += 2) {
        parsed.push({ name: rawFacets[i], count: rawFacets[i + 1] });
      }
      setFacets(parsed);
    } catch (err) {
      console.error('Search error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { search('', 0, '', ''); }, [search]);

  const handleSearch = () => { setPage(0); search(query, 0, deptFilter, sort); };
  const handleFilter = (dept) => { setDeptFilter(dept); setPage(0); search(query, 0, dept, sort); };
  const handleSort = (e) => { setSort(e.target.value); search(query, page, deptFilter, e.target.value); };
  const handlePrev = () => { const p = page - 1; setPage(p); search(query, p, deptFilter, sort); };
  const handleNext = () => { const p = page + 1; setPage(p); search(query, p, deptFilter, sort); };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.7) return '#16a34a';
    if (gpa >= 3.4) return '#2563eb';
    return '#dc2626';
  };

  const getDeptIcon = (dept) => {
    if (dept === 'Computer Science') return '💻';
    if (dept === 'Software Engineering') return '⚙️';
    if (dept === 'Data Science') return '📊';
    return '🎓';
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🎓 Student Search Portal</h1>
          <p>Powered by Apache Solr • {total} students indexed</p>
        </div>
      </header>

      <main className="main-content">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, city, department..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>Search</button>
            {query && (
              <button className="clear-btn" onClick={() => { setQuery(''); search('', 0, deptFilter, sort); }}>✕</button>
            )}
          </div>

          <div className="controls">
            <select onChange={handleSort} value={sort}>
              <option value="">⇅ Sort by...</option>
              <option value="gpa desc">GPA: High → Low</option>
              <option value="gpa asc">GPA: Low → High</option>
              <option value="name asc">Name: A → Z</option>
              <option value="age asc">Age: Young → Old</option>
            </select>
            <span className="result-count">
              {loading ? '⏳ Searching...' : `Found ${total} result${total !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        <div className="content-area">
          {/* Sidebar Facets */}
          <aside className="sidebar">
            <div className="facet-box">
              <h3>📂 Filter by Department</h3>
              <button
                className={!deptFilter ? 'facet-btn active' : 'facet-btn'}
                onClick={() => handleFilter('')}
              >
                <span>All Departments</span>
                <span className="badge">{total}</span>
              </button>
              {facets.map(f => (
                <button
                  key={f.name}
                  className={deptFilter === f.name ? 'facet-btn active' : 'facet-btn'}
                  onClick={() => handleFilter(f.name)}
                >
                  <span>{getDeptIcon(f.name)} {f.name}</span>
                  <span className="badge">{f.count}</span>
                </button>
              ))}
            </div>

            <div className="facet-box">
              <h3>📈 GPA Legend</h3>
              <div className="legend-item"><span style={{color:'#16a34a'}}>●</span> 3.7+ Excellent</div>
              <div className="legend-item"><span style={{color:'#2563eb'}}>●</span> 3.4+ Good</div>
              <div className="legend-item"><span style={{color:'#dc2626'}}>●</span> Below 3.4</div>
            </div>
          </aside>

          {/* Results */}
          <section className="results-area">
            {loading ? (
              <div className="loading">⏳ Loading results...</div>
            ) : results.length === 0 ? (
              <div className="empty">
                <p>😔 No students found.</p>
                <p>Try a different search term.</p>
              </div>
            ) : (
              <>
                <div className="results-grid">
                  {results.map(doc => {
                    const hl = highlight[doc.id]?.name?.[0];
                    return (
                      <div className="card" key={doc.id}>
                        <div className="card-header">
                          <div className="avatar">{doc.name[0]?.charAt(0)}</div>
                          <div>
                            <h3
                              dangerouslySetInnerHTML={{
                                __html: hl || doc.name[0]
                              }}
                            />
                            <span className="dept-tag">{getDeptIcon(doc.department)} {doc.department}</span>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="info-row">
                            <span>📍 {doc.city}</span>
                            <span>🎂 Age {doc.age}</span>
                          </div>
                          <div className="gpa-row">
                            <span>GPA</span>
                            <strong style={{ color: getGPAColor(doc.gpa) }}>{doc.gpa}</strong>
                          </div>
                          <div className="gpa-bar">
                            <div
                              className="gpa-fill"
                              style={{
                                width: `${(doc.gpa / 4) * 100}%`,
                                background: getGPAColor(doc.gpa)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="pagination">
                  <button onClick={handlePrev} disabled={page === 0}>◀ Previous</button>
                  <div className="page-info">
                    {Array.from({ length: Math.ceil(total / ROWS) }, (_, i) => (
                      <button
                        key={i}
                        className={i === page ? 'page-num active' : 'page-num'}
                        onClick={() => { setPage(i); search(query, i, deptFilter, sort); }}
                      >{i + 1}</button>
                    ))}
                  </div>
                  <button onClick={handleNext} disabled={(page + 1) * ROWS >= total}>Next ▶</button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
