import React, { useState } from 'react';
import { useCVStore } from '../../store/CVContext';
import { Save, FolderOpen, Trash2, Clock, Check, Plus } from 'lucide-react';
import './VersionControl.css';

export const VersionControl = () => {
  const { cvData, saveVersion, loadVersion, deleteVersion } = useCVStore();
  const [newVersionName, setNewVersionName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleSave = () => {
    if (newVersionName.trim()) {
      saveVersion(newVersionName.trim());
      setNewVersionName('');
      setShowSaveInput(false);
    }
  };

  return (
    <div className="version-control-container">
      <div className="version-header">
        <div className="version-title">
          <FolderOpen size={18} />
          <span>Kayıtlı Versiyonlarım</span>
        </div>
        <button 
          className={`btn-save-toggle ${showSaveInput ? 'active' : ''}`}
          onClick={() => setShowSaveInput(!showSaveInput)}
        >
          {showSaveInput ? 'İptal' : <><Save size={16} /> Yeni Kaydet</>}
        </button>
      </div>

      {showSaveInput && (
        <div className="save-input-group animate-slide-down">
          <input 
            type="text" 
            placeholder="Versiyon ismi (örn: Frontend Dev)" 
            value={newVersionName}
            onChange={(e) => setNewVersionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button onClick={handleSave} className="btn-confirm-save">
            <Check size={16} />
          </button>
        </div>
      )}

      <div className="version-list">
        {cvData.savedVersions?.length === 0 ? (
          <p className="no-versions">Henüz kayıtlı versiyon yok. Mevcut CV'nizi yukarıdan kaydedebilirsiniz.</p>
        ) : (
          cvData.savedVersions.map((v) => (
            <div key={v.id} className="version-item glass">
              <div className="v-info" onClick={() => loadVersion(v.id)}>
                <div className="v-name">{v.name}</div>
                <div className="v-meta">
                  <Clock size={12} />
                  {new Date(v.lastModified).toLocaleDateString()}
                </div>
              </div>
              <div className="v-actions">
                <button 
                  className="btn-load" 
                  onClick={() => loadVersion(v.id)}
                  title="Yükle"
                >
                  Yükle
                </button>
                <button 
                  className="btn-delete" 
                  onClick={() => deleteVersion(v.id)}
                  title="Sil"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )).reverse()
        )}
      </div>
    </div>
  );
};
