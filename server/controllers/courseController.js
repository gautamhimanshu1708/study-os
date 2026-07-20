import Course from '../models/Course.js';

/**
 * @desc    Get all enrolled courses for logged-in user with filters
 * @route   GET /api/courses
 * @access  Private
 */
export const getCourses = async (req, res) => {
  try {
    const { platform, status, search } = req.query;

    const query = { user: req.user._id };

    if (platform) {
      query.platform = platform;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { instructorName: { $regex: search, $options: 'i' } },
        { platform: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query).sort({ updatedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Private
 */
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, user: req.user._id });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course details',
      error: error.message,
    });
  }
};

/**
 * @desc    Create new enrolled course
 * @route   POST /api/courses
 * @access  Private
 */
export const createCourse = async (req, res) => {
  try {
    const { courseName, platform, courseLink, instructorName, progressPercentage, status, notes } = req.body;

    if (!courseName) {
      return res.status(400).json({
        success: false,
        message: 'Course name is required',
      });
    }

    const course = new Course({
      user: req.user._id,
      courseName,
      platform: platform || 'Udemy',
      courseLink: courseLink || '',
      instructorName: instructorName || '',
      progressPercentage: progressPercentage !== undefined ? Number(progressPercentage) : 0,
      status: status || 'In Progress',
      notes: notes || '',
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course saved successfully',
      data: course,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save course',
      error: error.message,
    });
  }
};

/**
 * @desc    Update course details
 * @route   PUT /api/courses/:id
 * @access  Private
 */
export const updateCourse = async (req, res) => {
  try {
    const { courseName, platform, courseLink, instructorName, progressPercentage, status, notes } = req.body;

    const course = await Course.findOne({ _id: req.params.id, user: req.user._id });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (courseName !== undefined) course.courseName = courseName;
    if (platform !== undefined) course.platform = platform;
    if (courseLink !== undefined) course.courseLink = courseLink;
    if (instructorName !== undefined) course.instructorName = instructorName;
    if (progressPercentage !== undefined) course.progressPercentage = Number(progressPercentage);
    if (status !== undefined) course.status = status;
    if (notes !== undefined) course.notes = notes;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private
 */
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message,
    });
  }
};

/**
 * @desc    Quick update course progress percentage
 * @route   PATCH /api/courses/:id/progress
 * @access  Private
 */
export const updateProgress = async (req, res) => {
  try {
    const { progressPercentage } = req.body;

    if (progressPercentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Progress percentage is required',
      });
    }

    const course = await Course.findOne({ _id: req.params.id, user: req.user._id });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    course.progressPercentage = Math.min(100, Math.max(0, Number(progressPercentage)));
    await course.save();

    res.status(200).json({
      success: true,
      message: `Progress updated to ${course.progressPercentage}%`,
      data: course,
    });
  } catch (error) {
    console.error('Error updating course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message,
    });
  }
};

/**
 * @desc    Get Course statistics (Total, Completed, In Progress, Not Started, Avg Progress %)
 * @route   GET /api/courses/stats
 * @access  Private
 */
export const getCourseStats = async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user._id });

    const totalCourses = courses.length;
    const completedCourses = courses.filter((c) => c.status === 'Completed').length;
    const inProgressCourses = courses.filter((c) => c.status === 'In Progress').length;
    const notStartedCourses = courses.filter((c) => c.status === 'Not Started').length;

    const totalProgress = courses.reduce((acc, c) => acc + (c.progressPercentage || 0), 0);
    const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        averageProgress,
      },
    });
  } catch (error) {
    console.error('Error fetching course stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course statistics',
      error: error.message,
    });
  }
};
