# Goblin Repositor

## Initialize a new Debian repository

```
repositor.initialize <distribution>
```

Where the distribution is what you want.

## Publish packages of an Xcraft distribution into the Debian repository

```
repositor.publishPackage <distribution> <xcraftDistribution>
```

## Import the repository on Debian

Add a new entry in a source.list file

```
deb [signed-by=/xcraft/var/prodroot.<distribution>/linux-amd64/var/deb/public.gpg.key] file:/xcraft/var/prodroot.<distribution>/linux-amd64/var/deb/ <distribution> non-free
```
