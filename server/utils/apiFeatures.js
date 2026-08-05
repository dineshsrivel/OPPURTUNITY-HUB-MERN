/**
 * APIFeatures — chainable query builder for search, filter, sort, pagination
 *
 * Usage:
 *   const features = new APIFeatures(Opportunity.find(), req.query)
 *     .search(['title', 'description', 'skills'])
 *     .filter()
 *     .sort()
 *     .paginate();
 *   const results = await features.query;
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query       = query;
    this.queryString = queryString;
  }

  // Full-text search on specific fields
  search(fields = []) {
    if (this.queryString.search) {
      const regex     = { $regex: this.queryString.search, $options: 'i' };
      const orClauses = fields.map(f => ({ [f]: regex }));
      this.query = this.query.find({ $or: orClauses });
    }
    return this;
  }

  // Field-value filtering (excludes reserved keywords)
  filter() {
    const queryObj  = { ...this.queryString };
    const excluded  = ['search', 'sort', 'page', 'limit', 'fields'];
    excluded.forEach(el => delete queryObj[el]);

    // Support gte, gt, lte, lt operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query   = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Field selection
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query   = this.query.select(fields);
    }
    return this;
  }

  // Pagination
  paginate() {
    const page  = parseInt(this.queryString.page,  10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 20;
    const skip  = (page - 1) * limit;
    this.query  = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
