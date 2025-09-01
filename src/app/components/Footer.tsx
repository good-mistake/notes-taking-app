import React, { useState } from "react";
import { motion } from "framer-motion";
import { RootState } from "../redux/store";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  setFilter,
  setSearchQuery,
  toggleSettings,
  selectNotesState,
  closeSettings,
} from "../redux/noteSlice";
import {
  setView,
  setSelectedNote,
  clearSelection,
  openSearch,
} from "../redux/viewSlice";

type FooterProps = {
  setSwitchSearch?: React.Dispatch<React.SetStateAction<boolean>>;
};
const Footer: React.FC<FooterProps> = () => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector((s) => s.notes.notes);
  const view = useAppSelector((s: RootState) => s.view.view);
  const { showSettings } = useAppSelector(selectNotesState);

  const firstTag =
    notes
      .map((n) => n.tags || [])
      .flat()
      .find(Boolean) || null;

  const handleHome = () => {
    dispatch(setView("home"));
    dispatch(clearSelection());
    dispatch(setFilter("all"));
    dispatch(setSearchQuery(""));
    dispatch(closeSettings());
  };

  const handleSearch = () => {
    dispatch(setView("search"));
    dispatch(clearSelection());
    dispatch(setFilter("all"));
    dispatch(setSearchQuery(""));
    dispatch(closeSettings());
  };

  const handleArchive = () => {
    dispatch(setView("archive"));
    dispatch(clearSelection());
    dispatch(setFilter("archived"));
    dispatch(setSearchQuery(""));
    dispatch(closeSettings());
  };

  const handleTags = () => {
    dispatch(setView("tags"));
    dispatch(clearSelection());
    dispatch(closeSettings());
    if (firstTag) dispatch(setFilter({ tag: firstTag }));
    else dispatch(setFilter("all"));
    dispatch(setSearchQuery(""));
  };

  const handleSettings = () => {
    if (view === "settings" || showSettings) {
      dispatch(closeSettings());
      dispatch(setView("home"));
      dispatch(clearSelection());
      dispatch(setFilter("all"));
    } else {
      dispatch(setView("settings"));
      dispatch(clearSelection());
      dispatch(toggleSettings());
    }
  };

  const itemVariants = {
    idle: { scale: 1 },
    press: { scale: 0.95 },
  };
  return (
    <footer
      className="app-footer"
      role="navigation"
      aria-label="bottom-navigation"
    >
      <ol>
        <motion.li
          onClick={handleHome}
          className={view === "home" ? "active" : ""}
          initial="idle"
          whileTap="press"
          variants={itemVariants}
        >
          <div>
            <img src="/assets/images/icon-home.svg" alt="home" />
            <p>Home</p>
          </div>
        </motion.li>

        <motion.li
          onClick={handleSearch}
          className={view === "search" ? "active" : ""}
          initial="idle"
          whileTap="press"
          variants={itemVariants}
        >
          <div>
            <img src="/assets/images/icon-search.svg" alt="search" />
            <p>Search</p>
          </div>
        </motion.li>

        <motion.li
          onClick={handleArchive}
          className={view === "archive" ? "active" : ""}
          initial="idle"
          whileTap="press"
          variants={itemVariants}
        >
          <div>
            <img src="/assets/images/icon-archive.svg" alt="archive" />
            <p>Archive</p>
          </div>
        </motion.li>

        <motion.li
          onClick={handleTags}
          className={view === "tags" ? "active" : ""}
          initial="idle"
          whileTap="press"
          variants={itemVariants}
        >
          <div>
            <img src="/assets/images/icon-tag.svg" alt="tags" />
            <p>Tags</p>
          </div>
        </motion.li>

        <motion.li
          onClick={handleSettings}
          className={view === "settings" ? "active" : ""}
          initial="idle"
          whileTap="press"
          variants={itemVariants}
        >
          <div>
            <img src="/assets/images/icon-settings.svg" alt="settings" />
            <p>Settings</p>
          </div>
        </motion.li>
      </ol>
    </footer>
  );
};

export default Footer;
