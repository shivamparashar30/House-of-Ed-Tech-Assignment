import { mergeQueryKeys } from '@lukemorales/query-key-factory';

import { discover } from './discover';
import { genres } from './genres';
import { movies } from './movies';
import { search } from './search';
import { subscription } from './subscription';
import { tv } from './tv';

export const queries = mergeQueryKeys(movies, search, tv, genres, discover, subscription);
