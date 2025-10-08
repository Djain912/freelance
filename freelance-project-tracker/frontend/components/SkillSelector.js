import { useState, useRef, useEffect } from 'react';
import { ALL_SKILLS, PREDEFINED_SKILLS } from '../../shared/constants.js';

const SkillSelector = ({ selectedSkills = [], onSkillsChange, placeholder = "Select or type skills...", maxSkills = 20 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter skills based on search term and category
  const getFilteredSkills = () => {
    let skillsToShow = activeCategory === 'ALL' 
      ? ALL_SKILLS 
      : PREDEFINED_SKILLS[activeCategory] || [];

    if (searchTerm) {
      skillsToShow = skillsToShow.filter(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Remove already selected skills
    return skillsToShow.filter(skill => !selectedSkills.includes(skill));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setCustomSkill('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSkillAdd = (skill) => {
    if (!selectedSkills.includes(skill) && selectedSkills.length < maxSkills) {
      onSkillsChange([...selectedSkills, skill]);
      setSearchTerm('');
      setCustomSkill('');
      inputRef.current?.focus();
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    onSkillsChange(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleCustomSkillAdd = () => {
    const skill = customSkill.trim();
    if (skill && !selectedSkills.includes(skill) && selectedSkills.length < maxSkills) {
      onSkillsChange([...selectedSkills, skill]);
      setCustomSkill('');
      setSearchTerm('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (customSkill.trim()) {
        handleCustomSkillAdd();
      } else if (searchTerm) {
        const filteredSkills = getFilteredSkills();
        if (filteredSkills.length > 0) {
          handleSkillAdd(filteredSkills[0]);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      setCustomSkill('');
    }
  };

  const categories = [
    { key: 'ALL', label: 'All Skills' },
    { key: 'PROGRAMMING', label: 'Programming' },
    { key: 'WEB_FRONTEND', label: 'Frontend' },
    { key: 'WEB_BACKEND', label: 'Backend' },
    { key: 'MOBILE', label: 'Mobile' },
    { key: 'DATABASES', label: 'Databases' },
    { key: 'CLOUD_DEVOPS', label: 'Cloud/DevOps' },
    { key: 'DESIGN', label: 'Design' },
    { key: 'DATA_AI', label: 'Data/AI' },
    { key: 'MARKETING', label: 'Marketing' },
    { key: 'OTHER_TECH', label: 'Other Tech' },
    { key: 'SOFT_SKILLS', label: 'Soft Skills' }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Skills Display */}
      {selectedSkills.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedSkills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-sm backdrop-blur-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleSkillRemove(skill)}
                className="ml-2 text-blue-300 hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={selectedSkills.length >= maxSkills ? `Maximum ${maxSkills} skills reached` : placeholder}
          disabled={selectedSkills.length >= maxSkills}
          value={searchTerm || customSkill}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            setCustomSkill(value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        {selectedSkills.length < maxSkills && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
            {selectedSkills.length}/{maxSkills}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && selectedSkills.length < maxSkills && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 border border-gray-600 rounded-lg shadow-2xl backdrop-blur-sm z-50 max-h-96 overflow-hidden">
          {/* Category Tabs */}
          <div className="flex overflow-x-auto bg-gray-900/50 border-b border-gray-600">
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => setActiveCategory(category.key)}
                className={`px-3 py-2 text-xs whitespace-nowrap transition-colors ${
                  activeCategory === category.key
                    ? 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Skills List */}
          <div className="max-h-64 overflow-y-auto">
            {/* Custom Skill Option */}
            {customSkill.trim() && !ALL_SKILLS.includes(customSkill.trim()) && (
              <button
                type="button"
                onClick={handleCustomSkillAdd}
                className="w-full px-4 py-2 text-left hover:bg-gray-700/50 text-green-400 border-b border-gray-700 transition-colors"
              >
                ✨ Add "{customSkill.trim()}" as custom skill
              </button>
            )}

            {/* Predefined Skills */}
            {getFilteredSkills().map((skill, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSkillAdd(skill)}
                className="w-full px-4 py-2 text-left hover:bg-gray-700/50 text-gray-200 border-b border-gray-700/50 transition-colors"
              >
                {skill}
              </button>
            ))}

            {getFilteredSkills().length === 0 && !customSkill.trim() && (
              <div className="px-4 py-3 text-gray-400 text-center">
                No skills found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSelector;