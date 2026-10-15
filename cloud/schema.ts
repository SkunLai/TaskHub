import { sqliteTable, text, integer, index, primaryKey, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
const requiredText = (name: string) => text(name).notNull();
const requiredInteger = (name: string) => integer(name).notNull();
export const workspaces = sqliteTable('workspaces', { id: text('id').primaryKey(), name: requiredText('name') });
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), email: requiredText('email').unique(), name: requiredText('name'), password: requiredText('password'),
  workspace: requiredText('workspace').references(() => workspaces.id, { onDelete: 'cascade' }),
  role: requiredText('role'), company_size: requiredText('company_size'), consent_at: requiredText('consent_at'), consent_version: requiredText('consent_version'),
}, t => [index('users_retention').on(t.role,t.consent_at)]);
export const sessions = sqliteTable('sessions', {
  token: text('token').primaryKey(), user_id: requiredText('user_id').references(() => users.id,{onDelete:'cascade'}), expires: requiredInteger('expires'),
}, t => [index('sessions_expiry').on(t.expires)]);
export const tours = sqliteTable('tours', {
  id: text('id').primaryKey(), workspace: requiredText('workspace').references(() => workspaces.id,{onDelete:'cascade'}),
  title: requiredText('title'), destination: requiredText('destination'), departure: requiredText('departure'), duration: requiredText('duration'),
  price: requiredInteger('price'), capacity: requiredInteger('capacity'), reserved: requiredInteger('reserved'), description: requiredText('description'),
  itinerary: requiredText('itinerary'), theme: requiredText('theme'), published: requiredInteger('published'), version: requiredInteger('version').default(1), updated: requiredText('updated'),
}, t => [index('tours_workspace').on(t.workspace),check('tour_price',sql`${t.price} >= 0`),check('tour_capacity',sql`${t.capacity} > 0`),check('tour_reserved',sql`${t.reserved} >= 0 AND ${t.reserved} <= ${t.capacity}`)]);
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(), workspace: requiredText('workspace').references(() => workspaces.id,{onDelete:'cascade'}),
  tour_id: requiredText('tour_id').references(() => tours.id,{onDelete:'cascade'}),title: requiredText('title'),assignee: requiredText('assignee'),
  due: requiredText('due'),priority: requiredText('priority'),status: requiredText('status'),created: requiredText('created'),
});
export const inquiries = sqliteTable('inquiries', {
  id: text('id').primaryKey(),workspace: requiredText('workspace').references(() => workspaces.id,{onDelete:'cascade'}),
  tour_id: requiredText('tour_id').references(() => tours.id,{onDelete:'cascade'}),name: requiredText('name'),email: requiredText('email'),people: requiredInteger('people'),
  note: requiredText('note'),status: requiredText('status'),created: requiredText('created'),consent_version: requiredText('consent_version'),
});
export const events = sqliteTable('events', {
  id: text('id').primaryKey(),user_id: requiredText('user_id').references(() => users.id,{onDelete:'cascade'}),action: requiredText('action'),entity: requiredText('entity'),created: requiredText('created'),
}, t => [index('events_user').on(t.user_id)]);
export const feedback = sqliteTable('feedback', {
  user_id: text('user_id').primaryKey().references(() => users.id,{onDelete:'cascade'}),portal: requiredInteger('portal'),operations: requiredInteger('operations'),sync: requiredInteger('sync'),ease: requiredInteger('ease'),
  intent: requiredText('intent'),price: requiredInteger('price'),liked: requiredText('liked'),disliked: requiredText('disliked'),created: requiredText('created'),
});
export const rateLimits = sqliteTable('rate_limits', {
  key: requiredText('key'),bucket: requiredInteger('bucket'),n: requiredInteger('n'),
},t=>[primaryKey({columns:[t.key,t.bucket]}),index('rate_limit_expiry').on(t.bucket)]);
