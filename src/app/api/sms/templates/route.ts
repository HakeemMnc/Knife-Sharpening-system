import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET() {
  try {
    const templates = await DatabaseService.getSMSTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error('❌ Failed to fetch SMS templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, template_content, description } = await request.json();
    
    if (!id || (!template_content && !description)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updates: { template_content?: string; description?: string } = {};
    if (template_content) updates.template_content = template_content;
    if (description) updates.description = description;

    const result = await DatabaseService.updateSMSTemplateFields(id, updates);
    return NextResponse.json({ success: true, template: result });
  } catch (error) {
    console.error('❌ Failed to update SMS template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}