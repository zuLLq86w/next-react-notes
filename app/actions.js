'use server';

import { redirect } from 'next/navigation';
import { addNote, updateNote, delNote } from '@/lib/redis';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
  content: z.string().min(1, '请填写内容').max(100, '字数最多100'),
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function saveNote(prevState, formData) {
  const noteId = formData.get('noteId');

  const data = JSON.stringify({
    title: formData.get('title'),
    content: formData.get('body'),
    updateTime: new Date(),
  });

  const validated = schema.safeParse(data);
  if (!validated.success) {
    return { errors: validated.error.issues };
  }

  // 为了让效果更明显
  await sleep(2000);

  if (noteId) {
    updateNote(noteId, data);
    revalidatePath('/', 'layout');
  } else {
    const res = await addNote(data);
    revalidatePath('/', 'layout');
  }
  return { message: `Add Success!` };
}

export async function deleteNote(prevState, formData) {
  const noteId = formData.get('noteId');
  delNote(noteId);
  revalidatePath('/', 'layout');
  redirect('/');
}
