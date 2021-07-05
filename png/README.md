# PNG spinner creator

This tool creates PNG versions of the line and dots spinners.

## Install dependencies

```shell
npm install
```

## Usage

### Get help

```shell
node lines --help
node dots --help
```

### Create a lines.png with default options

```shell
node lines
```

### Create a dots.png with default options

```shell
node dots
```

### Create a 512×512 pixel lines spinner in medium orchid

```shell
node lines --size 512px --colour mediumorchid
```

## Options (common to both)

### `-V, --version`

Output the version number.

### `-s, --size <size>`

Size of PNG in CSS units (output is square) (default: "128px").

### `-c, --colour <colour>`

Colour of the PNG (must be valid CSS colour) (default: "#006aff").

### `-f, --frame-multiplier <multiplier>`

Determines smoothness of animation (higher is better but also larger) (default: "2").

### `-h, --help`

Display help for command.
