# PNG spinner creator

This tool creates PNG versions of the line and dots spinners.

## Install dependencies

```shell
npm install
```

## Usage

### Get help

```shell
node . --help
```

### Create a lines.png with default options

```shell
node .
```

### Create a 512×512 pixel in medium orchid

```shell
node --size 512px --colour mediumorchid
```

## Options

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
