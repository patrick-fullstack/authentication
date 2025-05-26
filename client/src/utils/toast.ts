import { toast } from "sonner";
import React from "react";
import {
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  BsFillEnvelopeFill,
  BsPersonPlusFill,
  BsPersonDashFill,
  BsDoorOpenFill,
} from "react-icons/bs";
import { RiEdit2Fill, RiLoginBoxFill, RiUserAddFill } from "react-icons/ri";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineDelete,
  AiOutlineFileDone,
} from "react-icons/ai";
import { BiCommentX, BiCheckCircle, BiSolidCommentCheck } from "react-icons/bi";

import { GiWoodBeam } from "react-icons/gi";
import { MdSecurity } from "react-icons/md";

// Auth-specific toast messages with wood-themed styling
export const authToast = {
  // Generic success keeps the wood theme for branding consistency
  success: (message: string) => {
    return toast.success(message, {
      icon: React.createElement(GiWoodBeam, { size: 18, color: "#b15a42" }),
    });
  },

  error: (message: string) => {
    return toast.error(message, {
      icon: React.createElement(FaTimesCircle, { size: 18, color: "#b33636" }),
    });
  },

  info: (message: string) => {
    return toast.info(message, {
      icon: React.createElement(FaInfoCircle, { size: 18, color: "#286294" }),
    });
  },

  warning: (message: string) => {
    return toast.warning(message, {
      icon: React.createElement(FaExclamationTriangle, {
        size: 18,
        color: "#a16614",
      }),
    });
  },

  // Special auth messages with more detailed UI and varied wood-themed success icons
  loginSuccess: () => {
    return toast.success("Welcome back!", {
      description: "You have successfully signed in to your account.",
      icon: React.createElement(RiLoginBoxFill, { size: 18, color: "#b15a42" }),
    });
  },

  registerSuccess: () => {
    return toast.success("Account created!", {
      description:
        "Welcome aboard. Your account has been created successfully.",
      icon: React.createElement(RiUserAddFill, { size: 18, color: "#b15a42" }),
    });
  },

  otpSent: () => {
    return toast.info("Verification code sent", {
      description: "Please check your email for the verification code.",
      icon: React.createElement(BsFillEnvelopeFill, {
        size: 18,
        color: "#286294",
      }),
    });
  },

  passwordReset: () => {
    return toast.success("Password reset complete", {
      description: "Your password has been successfully reset.",
      icon: React.createElement(MdSecurity, {
        size: 18,
        color: "#3c6e3c",
      }),
    });
  },

  logout: () => {
    return toast.info("Logged out", {
      description: "You have been successfully logged out of your account.",
      icon: React.createElement(BsDoorOpenFill, {
        size: 18,
        color: "#286294",
      }),
    });
  },
};

// Post-related toast messages with distinct success icons
export const postToast = {
  // Generic post success uses a standard check mark
  success: (message: string) => {
    return toast.success(message, {
      icon: React.createElement(BiCheckCircle, { size: 18, color: "#3c6e3c" }),
    });
  },

  error: (message: string) => {
    return toast.error(message, {
      icon: React.createElement(FaTimesCircle, { size: 18, color: "#b33636" }),
    });
  },

  postCreated: () => {
    return toast.success("Post created", {
      description: "Your post has been successfully created.",
      icon: React.createElement(AiOutlineFileDone, {
        size: 18,
        color: "#3c6e3c",
      }),
    });
  },

  postUpdated: () => {
    return toast.success("Post updated", {
      description: "Your post has been successfully updated.",
      icon: React.createElement(RiEdit2Fill, { size: 18, color: "#3c6e3c" }),
    });
  },

  postDeleted: () => {
    return toast.success("Post deleted", {
      description: "Your post has been successfully removed.",
      icon: React.createElement(AiOutlineDelete, {
        size: 18,
        color: "#3c6e3c",
      }),
    });
  },

  commentAdded: () => {
    return toast.success("Comment added", {
      description: "Your comment has been added to the post.",
      icon: React.createElement(BiSolidCommentCheck, {
        size: 18,
        color: "#3c6e3c",
      }),
    });
  },

  commentDeleted: () => {
    return toast.success("Comment removed", {
      description: "Your comment has been removed from the post.",
      icon: React.createElement(BiCommentX, { size: 18, color: "#3c6e3c" }),
    });
  },

  editorAdded: () => {
    return toast.success("Editor added", {
      description: "The user can now edit this post.",
      icon: React.createElement(BsPersonPlusFill, {
        size: 18,
        color: "#3c6e3c",
      }),
    });
  },

  editorRemoved: () => {
    return toast.success("Editor removed", {
      description: "The user can no longer edit this post.",
      icon: React.createElement(BsPersonDashFill, {
        size: 18,
        color: "#3c6e3c",
      }),
    });
  },

  postLiked: () => {
    return toast.success("Post liked", {
      icon: React.createElement(AiFillHeart, { size: 18, color: "#e57878" }),
    });
  },

  postUnliked: () => {
    return toast.success("Post unliked", {
      icon: React.createElement(AiOutlineHeart, { size: 18, color: "#776659" }),
    });
  },
};
