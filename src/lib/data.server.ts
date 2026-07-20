/**
 * Server-only re-export of static data.
 *
 * Importing this module from a Client Component will cause a build-time error,
 * preventing the ~140 KB data payload from being bundled into the client JS.
 *
 * Usage: import { rockets, agencies, ... } from '@/lib/data.server';
 */
import 'server-only';

export {
  rockets,
  agencies,
  planets,
  missions,
  astronauts,
  satellites,
  upcomingLaunches,
  spaceNews,
  quizzes,
} from './data';
