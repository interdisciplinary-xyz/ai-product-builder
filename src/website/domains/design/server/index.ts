/**
 * `design/server` — reads app/globals.css off disk, so it is Node-only and
 * stays out of the client barrel.
 */
export { tokenGroups, isColour, stylesheetFacts, typeScale } from './stylesheet';
