
_peek() {
    local cur prev
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    # File and directory completion
    COMPREPLY=( $(compgen -f -- "$cur") )
    return 0
}
complete -F _peek peek

