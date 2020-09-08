const dummy = blogs => {
  return 1;
};

const totalLikes = blogs => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = blogs => {
  const likes = blogs.map(blog => blog.likes);
  const mostLikes = likes.reduce((a, b) => Math.max(a, b));
  const favBlog = blogs.filter(blog => blog.likes === mostLikes);

  return {
    title: favBlog[0].title,
    author: favBlog[0].author,
    likes: favBlog[0].likes,
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};