# Survey Data

In the interest of open science, this directory contains all survey instruments, anonymized response data, and analysis code associated with the paper *Teaching Machine Learning Fundamentals with LEGO Robotics* ([arXiv:2601.19376](https://arxiv.org/abs/2601.19376)).

## Structure
```
survey/
├── analysis.ipynb       # Jupyter notebook with full statistical analysis
├── codebook.json        # Question definitions, answer keys, and scale descriptions
├── instruments/
│   ├── pre.pdf          # Pre-course survey instrument (German)
│   └── post.pdf         # Post-course survey instrument (German)
└── data/
    ├── cohort_1/
    │   ├── pre.json     # Pre-course responses, cohort 1
    │   └── post.json    # Post-course responses, cohort 1
    └── cohort_2/
        ├── pre.json     # Pre-course responses, cohort 2
        └── post.json    # Post-course responses, cohort 2
```

## Notes

- All responses are anonymous. No identifying information was collected.
- Likert responses are stored as integers (1–5). Missing responses are stored as `null`.
- The codebook maps all question and answer IDs to their full German text and scale descriptions.