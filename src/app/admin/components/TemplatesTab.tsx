'use client';

import { useState, useEffect } from 'react';

interface SmsTemplate {
  id: number;
  template_name: string;
  template_content: string;
  description: string;
  placeholders?: string[];
}

export default function TemplatesTab() {
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null);
  const [templateContent, setTemplateContent] = useState('');

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/sms/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const result = await response.json();
      if (result.success) {
        setTemplates(result.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const updateTemplate = async (id: number, content: string) => {
    try {
      const response = await fetch('/api/sms/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, template_content: content })
      });

      if (!response.ok) throw new Error('Failed to update template');

      await fetchTemplates();
      setEditingTemplate(null);
      setTemplateContent('');
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template');
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold">SMS Templates</h2>
        <button
          onClick={fetchTemplates}
          className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-blue-700 text-sm md:text-base"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900 capitalize">
                  {template.template_name.replace('_', ' ')}
                </h3>
                <p className="text-sm text-gray-500">{template.description}</p>
                {template.placeholders && template.placeholders.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Placeholders: {template.placeholders.join(', ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setEditingTemplate(template);
                  setTemplateContent(template.template_content);
                }}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                Edit
              </button>
            </div>

            {editingTemplate?.id === template.id ? (
              <div className="space-y-3">
                <textarea
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-vertical min-h-[120px]"
                  placeholder="Enter SMS template content..."
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateTemplate(template.id, templateContent)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingTemplate(null);
                      setTemplateContent('');
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded border text-sm">
                {template.template_content}
              </div>
            )}
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-gray-600">No SMS templates found</div>
        </div>
      )}
    </div>
  );
}
