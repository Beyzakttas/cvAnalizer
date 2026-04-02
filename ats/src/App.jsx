import React, { useState } from 'react';
import './styles/global.css';
import { Layout } from './components/Layout';
import { ProfileForm } from './components/ProfileForm';
import { JobAnalyzer } from './components/JobAnalyzer';
import { TailorView } from './components/TailorView';
import { ATSPreview } from './components/ATSPreview';
import { JobSearch } from './components/JobSearch/JobSearch';
import { LanguageSelect } from './components/LanguageSelect/LanguageSelect';

const STEPS = {
  SEARCH: 'SEARCH',
  PROFILE: 'PROFILE',
  ANALYZER: 'ANALYZER',
  TAILOR: 'TAILOR',
  EXPORT: 'EXPORT'
};

const STEP_ORDER = [STEPS.SEARCH, STEPS.PROFILE, STEPS.ANALYZER, STEPS.TAILOR, STEPS.EXPORT];

function App() {
  const [activeStep, setActiveStep] = useState(STEPS.SEARCH);
  const [pendingUrl, setPendingUrl] = useState('');

  const handleAnalyzeJob = (url) => {
    setPendingUrl(url);
    setActiveStep(STEPS.ANALYZER);
  };

  const renderStep = () => {
    switch (activeStep) {
      case STEPS.SEARCH: return <JobSearch onAnalyzeJob={handleAnalyzeJob} onNext={() => setActiveStep(STEPS.PROFILE)} />;
      case STEPS.PROFILE: return <ProfileForm onNext={() => setActiveStep(STEPS.ANALYZER)} />;
      case STEPS.ANALYZER: return (
        <JobAnalyzer 
          initialUrl={pendingUrl}
          onNext={() => setActiveStep(STEPS.TAILOR)} 
          onBack={() => setActiveStep(STEPS.PROFILE)} 
        />
      );
      case STEPS.TAILOR: return <TailorView onNext={() => setActiveStep(STEPS.EXPORT)} onBack={() => setActiveStep(STEPS.ANALYZER)} />;
      case STEPS.EXPORT: return <ATSPreview onBack={() => setActiveStep(STEPS.TAILOR)} />;
      default: return <LanguageSelect onNext={() => setActiveStep(STEPS.SEARCH)} />;
    }
  };

  return (
    <div className="app-container">
      <div className="bg-mesh"></div>
      <Layout activeStep={activeStep} onStepChange={setActiveStep}>
        {renderStep()}
      </Layout>
    </div>
  );
}

export default App;
