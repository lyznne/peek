/**
 * * CLI module for Peek tool.
 * * This module handles command-line interactions and user inputs.
 */
use clap::Parser;

#[derive(Parser, Debug)]
#[command(
    name = "peek",
    version,
    about = "Open files and directories in your default browser",
    long_about = "A fast CLI tool to quicky open PDFs, images, videos, and text files in your default web browser directly from the command line."
)]
pub struct Cli {
    /// File, directory, or search pattern to open
    ///
    /// If the path doesn't exist, peek will search for matching files
    /// in the current directory. If no path is provided, opens current directory.
    pub path: Option<String>,
}
