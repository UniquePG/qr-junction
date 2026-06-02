import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { LeadStatus } from '@prisma/client';

export async function PUT(
  request: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const leadId = parseInt(id, 10);
    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid Lead ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, notes } = body;

    // Verify ownership
    const existing = await prisma.lead.findFirst({
      where: { id: leadId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Validate status if provided
    if (status && !Object.values(LeadStatus).includes(status)) {
      return NextResponse.json(
        { error: `Bad Request: Invalid status. Must be one of: ${Object.values(LeadStatus).join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const leadId = parseInt(id, 10);
    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid Lead ID' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.lead.findFirst({
      where: { id: leadId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Delete from database
    await prisma.lead.delete({
      where: { id: leadId },
    });

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
