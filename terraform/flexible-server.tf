locals {
  azure-metadeta = "azure.extensions"
}

# Postgresql Flexible Server
resource "azurerm_postgresql_flexible_server" "postgresql_server" {
  name                   = "${var.project_name}-db-server"
  resource_group_name    = azurerm_resource_group.grp.name
  location               = azurerm_resource_group.grp.location
  version                = "13"
  administrator_login    = var.dbadmin
  administrator_password = var.dbpassword
  sku_name               = "GP_Standard_D4s_v3"
  storage_mb             = 32768
  zone                   = "1"
}

# Allow connections from other Azure Services
resource "azurerm_postgresql_flexible_server_firewall_rule" "postgresql_server_fw" {
  name             = "${var.project_name}-db-server-fw"
  server_id        = azurerm_postgresql_flexible_server.postgresql_server.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Enable the uuid-ossp extension
resource "azurerm_postgresql_flexible_server_configuration" "postgresql_server_config" {
  name      = local.azure-metadeta
  server_id = azurerm_postgresql_flexible_server.postgresql_server.id
  value     = "uuid-ossp"
}

# Acme Fitness Catalog & Order Postgresql DB
resource "azurerm_postgresql_flexible_server_database" "postgre_db" {
  name      = var.postgres_db_name[count.index]
  server_id = azurerm_postgresql_flexible_server.postgresql_server.id
  collation = "en_US.utf8"
  charset   = "utf8"
  count     = length(var.postgres_db_name)
}
