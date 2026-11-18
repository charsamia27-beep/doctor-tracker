// Centralised, hierarchical query keys → precise cache invalidation.
export const qk = {
  me: ['me'],
  doctors: {
    all: ['doctors'],
    list: (params) => ['doctors', 'list', params],
    detail: (id) => ['doctors', 'detail', id],
    patients: (id, params) => ['doctors', 'detail', id, 'patients', params],
    meta: ['doctors', 'meta'],
    options: ['doctors', 'options'],
  },
  patients: {
    all: ['patients'],
    list: (params) => ['patients', 'list', params],
  },
  stats: (range) => ['stats', range],
  audit: (params) => ['audit', params],
  search: (term) => ['search', term],
};
